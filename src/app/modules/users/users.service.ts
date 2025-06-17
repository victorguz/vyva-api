import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { User, UserKey } from '../../entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
} from './dto/users.dto';
import { handleError } from '../../shared/error.functions';
import { v4 as uuidv4 } from 'uuid';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { encrypt } from '../../shared/shared.functions';
import { AuthUser } from '../auth/dtos/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly model: Model<User, UserKey>,
  ) {}

  async findAll(): Promise<GenericResponse<User[]>> {
    try {
      const users = await this.model.scan().exec();
      return new GenericResponse(
        users.map((user) => {
          const userData = user.toJSON() as User;
          delete userData.password;
          return userData;
        }),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string): Promise<GenericResponse<User>> {
    try {
      const user = await this.model.get({ id });
      if (!user) {
        throw new Error('MS007');
      }
      const userData = user.toJSON() as User;
      delete userData.password;
      return new GenericResponse(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOneByEmail(email: string): Promise<GenericResponse<User>> {
    try {
      const users = await this.model
        .scan()
        .where('email')
        .eq(email.toLowerCase())
        .exec();

      if (!users || users.length === 0) {
        throw new Error('MS007');
      }

      const userData = users[0].toJSON() as User;
      delete userData.password;
      return new GenericResponse(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async create(body: CreateUserDto): Promise<GenericResponse<User>> {
    try {
      // Verificar email duplicado
      const existingEmail = await this.model
        .scan()
        .where('email')
        .eq(body.email.toLowerCase())
        .exec();

      if (existingEmail && existingEmail.length > 0) {
        throw new Error('MS005');
      }

      if (body.documentNumber && body.documentType) {
        // Verificar documento duplicado
        const existingDocument = await this.model
          .scan()
          .where('documentNumber')
          .eq(body.documentNumber)
          .where('documentType')
          .eq(body.documentType)
          .exec();

        if (existingDocument && existingDocument.length > 0) {
          throw new Error('MS004');
        }
      }

      // Si no hay duplicados, crear el usuario
      const newUser = await this.model.create({
        id: uuidv4(),
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email.toLowerCase(),
        password: encrypt(body.password),
        role: body.role,
        status: true,
        documentType: body.documentType,
        documentNumber: body.documentNumber,
        googleId: body.googleId,
        profilePicture: body.profilePicture,
        isVerified: body.isVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const userData = newUser.toJSON() as User;
      delete userData.password;
      return new GenericResponse(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<GenericResponse<User>> {
    try {
      // Verify document is not duplicated
      if (updateUserDto.documentNumber || updateUserDto.documentType) {
        const existingDocument = await this.model
          .scan()
          .where('documentNumber')
          .eq(updateUserDto.documentNumber)
          .where('documentType')
          .eq(updateUserDto.documentType)
          .exec();

        if (existingDocument && existingDocument.length > 0) {
          const existingUser = existingDocument[0];
          if (existingUser.id !== id) {
            throw new Error('MS004');
          }
        }
      }

      // Encrypt password if it's being updated
      if (updateUserDto.password) {
        updateUserDto.password = encrypt(updateUserDto.password);
      }

      await this.model.update({ id }, updateUserDto);
      const updatedUser = await this.model.get({ id });
      if (!updatedUser) {
        throw new Error('MS007');
      }
      const userData = updatedUser.toJSON() as User;
      delete userData.password;
      return new GenericResponse(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string): Promise<GenericResponse<void>> {
    try {
      const user = await this.model.get({ id });
      if (!user) {
        throw new Error('MS007');
      }
      await this.model.update({ id }, { status: false });
      return new GenericResponse(undefined);
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateProfile(
    user: AuthUser,
    updateProfileDto: UpdateProfileDto,
  ): Promise<GenericResponse<User>> {
    try {
      const userData = await this.model.get({ id: user.sub });
      if (!userData) {
        throw new Error('MS007');
      }

      const updatedUser = await this.model.update(
        { id: user.sub },
        { ...updateProfileDto },
      );

      return new GenericResponse<User>(updatedUser);
    } catch (error) {
      console.log(error);
      throw handleError(error);
    }
  }
}
