import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { GenericResponse } from 'src/app/core/interfaces/generic-response.interface';
import { User, UserKey } from 'src/app/schemas/user.schema';
import { handleError } from 'src/app/shared/error.functions';
import { decrypt } from 'src/app/shared/shared.functions';

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
        const createUserResponse = await this.usersService.create({
          firstName: given_name || name?.split(' ')[0] || '',
          lastName: family_name || name?.split(' ').slice(1).join(' ') || '',
          email: email ? email.toLowerCase() : '',
          googleId: sub,
          profilePicture: picture || '',
          isVerified: true,
        });
        userData = createUserResponse.data;
      } else {
        userData = existingUser[0].toJSON();

        // Update user using UsersService if needed
        if (
          !userData.googleId ||
          !userData.profilePicture ||
          !userData.businessInfoId ||
          !userData.apiKey
        ) {
          const updateUserResponse = await this.usersService.update(
            userData.id,
            {
              googleId: sub,
              isVerified: true,
              profilePicture: picture || userData.profilePicture,
            },
          );
          userData = updateUserResponse.data;
        }
      }

      const { password, ...userWithoutPassword } = userData;

      const token = this.jwtService.sign({
        sub: userData.id,
        email: userData.email || '',
        role: userData.role || '',
        businessInfoId: userData.businessInfoId,
      });
      return new GenericResponse<AuthResponse>({
        token,
        user: userWithoutPassword as UserResponse,
      });
    } catch (error) {
      throw handleError(error);
    }
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
      const token = this.jwtService.sign({
        sub: userData.id,
        email: userData.email || '',
        role: userData.role || '',
        businessInfoId: userData.businessInfoId,
      });
      return new GenericResponse<AuthResponse>({
        token,
        user: userWithoutPassword as UserResponse,
      });
    } catch (error) {
      throw handleError(error);
    }
  }
  // Removed code-exchange flow; we only accept ID tokens at /public/google
}
