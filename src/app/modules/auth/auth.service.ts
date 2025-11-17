import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { GenericResponse } from 'src/app/core/interfaces/generic-response.interface';
import { User, UserKey } from 'src/app/schemas/user.schema';
import { handleError } from 'src/app/shared/error.functions';
import { decrypt } from 'src/app/shared/shared.functions';

import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { GoogleSignInDto, RefreshTokenRequest } from './dtos/auth.dto';
import { AuthResponse, UserResponse } from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('User')
    private readonly userModel: Model<User, UserKey>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(clientId);
  }

  async refreshToken(
    body: RefreshTokenRequest,
  ): Promise<GenericResponse<AuthResponse>> {
    try {
      const user = await this.userModel
        .scan()
        .where('email')
        .eq(body.email.toLowerCase())
        .exec();

      if (!user || user.length === 0) {
        throw new Error('MS016'); // Usuario no registrado
      }

      const userData = user[0].toJSON();
      const { password, ...userWithoutPassword } = userData;
      const decryptedPassword = decrypt(password);

      if (decryptedPassword !== body.password) {
        throw new Error('MS017'); // Usuario o contraseña incorrectos
      }

      if (!userData.status) {
        throw new Error('MS023'); // Usuario sin acceso permitido
      }

      const token = this.jwtService.sign({
        sub: userData.id,
        email: userData.email || '',
        role: userData.role || '',
      });

      return new GenericResponse<AuthResponse>({
        token,
        user: userWithoutPassword as UserResponse,
      });
    } catch (error) {
      throw handleError(error);
    }
  }

  async googleSignIn(
    body: GoogleSignInDto,
  ): Promise<GenericResponse<AuthResponse>> {
    try {
      // Verify the Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: body.token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('MS016'); // Invalid token
      }

      const { email, name, given_name, family_name, picture, sub } = payload;

      // Check if user already exists (only if email is provided)
      let existingUser = null;
      if (email) {
        existingUser = await this.userModel
          .scan()
          .where('email')
          .eq(email.toLowerCase())
          .exec();
      }

      let userData;

      if (!existingUser || existingUser.length === 0) {
        // Create new user using UsersService
        const createUserResponse = await this.usersService.createGoogleUser({
          firstName: given_name || name?.split(' ')[0] || '',
          lastName: family_name || name?.split(' ').slice(1).join(' ') || '',
          email: email.toLowerCase(),
          googleId: sub,
          profilePicture: picture || '',
          isVerified: payload.email_verified ?? false,
        });
        
        userData = createUserResponse.data;

        // Download and save Google profile picture if exists and user has businessInfoId
        if (picture && userData.businessInfoId) {
          const s3ProfilePictureUrl = await this.downloadAndSaveGoogleProfilePicture(
            picture,
            userData.id,
            userData.businessInfoId,
          );

          // Update user with S3 URL if download was successful
          if (s3ProfilePictureUrl) {
            const updateUserResponse = await this.usersService.updateGoogleUser(
              userData.id,
              {
                googleId: sub,
                isVerified: payload.email_verified ?? false,
                profilePicture: s3ProfilePictureUrl,
              },
            );
            userData = updateUserResponse.data;
          }
        }
      } else {
        userData = existingUser[0].toJSON();

        // Download and save Google profile picture if exists, user has businessInfoId, and doesn't already have a profile picture
        let profilePictureUrl = userData.profilePicture;
        if (picture && userData.businessInfoId && !userData.profilePicture) {
          const s3ProfilePictureUrl = await this.downloadAndSaveGoogleProfilePicture(
            picture,
            userData.id,
            userData.businessInfoId,
          );
          if (s3ProfilePictureUrl) {
            profilePictureUrl = s3ProfilePictureUrl;
          }
        }

        // Update user using UsersService if needed
        if (
          !userData.googleId ||
          !userData.profilePicture ||
          !userData.apiKey
        ) {
          const updateUserResponse = await this.usersService.updateGoogleUser(
            userData.id,
            {
              googleId: sub,
              isVerified: payload.email_verified ?? false,
              profilePicture: profilePictureUrl || picture || userData.profilePicture,
            },
          );
          userData = updateUserResponse.data;
        }
      }

      const { password, ...userWithoutPassword } = userData as User;

      const token = this.createToken(userWithoutPassword as User);
      return new GenericResponse<AuthResponse>({
        token,
        user: userWithoutPassword as UserResponse,
      });
    } catch (error) {
      throw handleError(error);
    }
  }

  createToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email || '',
      role: user.role || '',
      businessInfoId: user.businessInfoId,
    });
  }

  async loginWithApiKey(
    phone: string,
    apiKey: string,
  ): Promise<GenericResponse<AuthResponse>> {
    try {
      const userApiKey = await this.userModel
        .scan()
        .where('apiKey')
        .eq(apiKey)
        .exec();
      if (!userApiKey || userApiKey.length === 0) {
        throw new Error('MS016');
      }
      const user = await this.userModel
        .scan()
        .where('phone')
        .eq(phone.toLowerCase())
        .exec();
      if (!user || user.length === 0) {
        throw new Error('MS016');
      }
      const userData = user[0].toJSON();
      const { password, ...userWithoutPassword } = userData;
      const token = this.createToken(userWithoutPassword as User);
      return new GenericResponse<AuthResponse>({
        token,
        user: userWithoutPassword as UserResponse,
      });
    } catch (error) {
      throw handleError(error);
    }
  }
  /**
   * Download Google profile picture and save it to S3 bucket
   * This function is separated to keep it isolated from the main login flow
   * @param pictureUrl Google profile picture URL
   * @param userId User ID
   * @param businessInfoId Business ID to organize files in S3
   * @returns S3 URL of the uploaded profile picture, or null if download fails
   */
  private async downloadAndSaveGoogleProfilePicture(
    pictureUrl: string | undefined,
    userId: string,
    businessInfoId: string | undefined,
  ): Promise<string | null> {
    try {
      // Skip if no profile picture URL or no businessInfoId
      if (!pictureUrl || !businessInfoId) {
        return null;
      }

      // Generate a unique file name based on user ID and timestamp
      const timestamp = Date.now();
      const fileExtension = pictureUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `profile-picture-${userId}-${timestamp}.${fileExtension}`;

      // Download and upload to S3
      const file = await this.filesService.uploadFileFromUrl(
        pictureUrl,
        fileName,
        businessInfoId,
        userId,
        'profile-pictures',
      );

      return file.url;
    } catch (error) {
      // Log error but don't throw - profile picture download is not critical
      console.error('Failed to download and save Google profile picture:', error);
      return null;
    }
  }

  // Removed code-exchange flow; we only accept ID tokens at /public/google
}
