import { Injectable } from '@nestjs/common';
import {
  AuthCreateUserDto,
  AuthRequestDto,
  GoogleSignInDto,
  RefreshTokenRequest,
} from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { handleError } from 'src/app/shared/error.functions';
import { GenericResponse } from 'src/app/core/interfaces/generic-response.interface';
import { AuthResponse, UserResponse } from './interfaces/auth.interfaces';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { UserRole } from 'src/app/core/constants/domain.constants';
import { User, UserKey } from 'src/app/entities/user.entity';
import { decrypt, encrypt } from 'src/app/shared/shared.functions';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('User')
    private readonly userModel: Model<User, UserKey>,
    private readonly configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(clientId);
  }

  /**
   * Los usuarios administradores nuevos solo pueden ser creados
   * si su correo no está en uso en otro usuario vyva ni como usuario de una empresa.
   *
   * Los usuarios de tipo customer anclados a una empresa no pueden iniciar sesión.
   * @param body
   * @returns
   */
  async createUser(
    body: AuthCreateUserDto,
  ): Promise<GenericResponse<AuthResponse>> {
    try {
      const [firstName, ...lastNameParts] = body.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const now = new Date();
      const user = await this.userModel.create({
        id: uuidv4(),
        firstName,
        lastName,
        email: body.email.toLowerCase(),
        password: encrypt(body.password),
        role: UserRole.customer,
        status: true,
        createdAt: now,
        updatedAt: now,
      });

      const userData = user.toJSON();
      const { password, ...userWithoutPassword } = userData;

      const token = this.jwtService.sign({
        sub: userData.id,
        email: userData.email,
        role: userData.role,
      });

      return new GenericResponse<AuthResponse>({
        token,
        user: userWithoutPassword as UserResponse,
      });
    } catch (error) {
      throw handleError(error);
    }
  }

  async login(body: AuthRequestDto): Promise<GenericResponse<AuthResponse>> {
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
        email: userData.email,
        role: userData.role,
      });

      return new GenericResponse<AuthResponse>({
        token,
        user: userWithoutPassword as UserResponse,
      });
    } catch (error) {
      throw handleError(error);
    }
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
        email: userData.email,
        role: userData.role,
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

      const { email, name, given_name, family_name, picture } = payload;

      // Check if user already exists
      const existingUser = await this.userModel
        .scan()
        .where('email')
        .eq(email.toLowerCase())
        .exec();

      let userData;

      if (!existingUser || existingUser.length === 0) {
        // Create new user
        const now = new Date();
        const user = await this.userModel.create({
          id: uuidv4(),
          firstName: given_name || name?.split(' ')[0] || '',
          lastName: family_name || name?.split(' ').slice(1).join(' ') || '',
          email: email.toLowerCase(),
          // Generate a random password that won't be used for login
          password: encrypt(Math.random().toString(36).substring(2, 15)),
          role: UserRole.customer,
          status: true,
          googleId: payload.sub,
          profilePicture: picture,
          isVerified: true,
          createdAt: now,
          updatedAt: now,
        });

        userData = user.toJSON();
      } else {
        userData = existingUser[0].toJSON();

        // Update Google ID and profile picture if not already set
        if (!userData.googleId || !userData.profilePicture) {
          await this.userModel.update({ id: userData.id } as UserKey, {
            googleId: payload.sub,
            isVerified: true,
            profilePicture: picture || userData.profilePicture,
          });
        }
      }

      const { password, ...userWithoutPassword } = userData;

      const token = this.jwtService.sign({
        sub: userData.id,
        email: userData.email,
        role: userData.role,
      });

      return new GenericResponse<AuthResponse>({
        token,
        user: userWithoutPassword as UserResponse,
      });
    } catch (error) {
      throw handleError(error);
    }
  }
}
