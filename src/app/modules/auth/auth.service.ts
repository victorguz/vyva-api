import { Injectable } from '@nestjs/common';
import {
  AuthCreateUserDto,
  AuthRequestDto,
  RefreshTokenRequest,
} from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { handleError } from 'src/app/shared/error.functions';
import { GenericResponse } from 'src/app/core/interfaces/generic-response.interface';
import { AuthResponse, UserResponse } from './interfaces/auth.interfaces';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { UserRole } from 'src/app/core/constants/domain.constants';
import { User, UserKey } from 'src/app/entities/user.entity';
import { decrypt } from 'src/app/shared/shared.functions';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('User')
    private readonly userModel: Model<User, UserKey>,
    private readonly usersService: UsersService,
  ) {}

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

      const createUserResponse = await this.usersService.create({
        firstName,
        lastName,
        email: body.email,
        password: body.password,
        role: UserRole.customer,
        status: true,
      });

      const userData = createUserResponse.data;
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
}
