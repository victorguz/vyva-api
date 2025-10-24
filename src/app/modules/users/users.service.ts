import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 as uuidv4 } from 'uuid';

import { UserRole } from '../../core/constants/domain.constants';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { User, UserKey } from '../../schemas/user.schema';
import { handleError } from '../../shared/error.functions';
import { encrypt } from '../../shared/shared.functions';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

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
      // Check if user already exists by email (only if email is provided)
      if (body.email) {
        const existingEmail = await this.model
          .scan()
          .where('email')
          .eq(body.email.toLowerCase())
          .exec();

        if (existingEmail && existingEmail.length > 0) {
          // If it's a Google user creation, return the existing user instead of throwing error
          if (body.googleId) {
            const userData = existingEmail[0].toJSON() as User;
            delete userData.password;
            return new GenericResponse<User>(userData);
          }
          throw new Error('MS005');
        }
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

      // Create the user
      const now = new Date();
      const newUser = await this.model.create({
        id: uuidv4(),
        firstName: body.firstName,
        lastName: body.lastName || '',
        email: body.email ? body.email.toLowerCase() : '',
        password: body.password
          ? encrypt(body.password)
          : encrypt(Math.random().toString(36).substring(2, 15)),
        role: body.role || UserRole.customer,
        status: body.status !== undefined ? body.status : true,
        documentType: body.documentType || '',
        documentNumber: body.documentNumber || '',
        googleId: body.googleId || '',
        profilePicture: body.profilePicture || '',
        isVerified: body.isVerified || false,
        createdAt: now,
        updatedAt: now,
        businessInfoId: body.businessInfoId || uuidv4(),
        apiKey: encrypt(uuidv4()),
      });

      const userData = newUser.toJSON() as User;
      delete userData.password;
      return new GenericResponse<User>(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<GenericResponse<User>> {
    try {
      // Get current user to check existing data
      const currentUser = await this.model.get({ id });
      if (!currentUser) {
        throw new Error('MS007');
      }

      const currentUserData = currentUser.toJSON();

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

      // Prepare update data with Google user logic
      const updateData: any = { ...updateUserDto };

      // Encrypt password if it's being updated
      if (updateUserDto.password) {
        updateData.password = encrypt(updateUserDto.password);
      }

      // Handle Google user specific updates
      if (updateUserDto.googleId) {
        // Update Google ID and profile picture if not already set
        if (!currentUserData.googleId || !currentUserData.profilePicture) {
          const newBusinessId = currentUserData.businessInfoId
            ? currentUserData.businessInfoId
            : uuidv4();
          const newApiKey = currentUserData.apiKey
            ? currentUserData.apiKey
            : encrypt(uuidv4());

          updateData.googleId = updateUserDto.googleId;
          updateData.isVerified = true;
          updateData.profilePicture =
            updateUserDto.profilePicture || currentUserData.profilePicture;
          updateData.businessInfoId = newBusinessId;
          updateData.apiKey = newApiKey;
        } else if (!currentUserData.businessInfoId) {
          // User has googleId and profilePicture but no businessInfoId
          updateData.businessInfoId = uuidv4();
        } else if (!currentUserData.apiKey) {
          updateData.apiKey = encrypt(uuidv4());
        }
      }

      await this.model.update({ id }, updateData);
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
}
