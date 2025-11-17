import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 as uuidv4 } from 'uuid';

import { UserRole } from '../../core/constants/domain.constants';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { User, UserKey } from '../../schemas/user.schema';
import { handleError } from '../../shared/error.functions';
import { deleteEmptyProperties, encrypt } from '../../shared/shared.functions';
import { CreateGoogleUserDto, CreateUserDto, UpdateGoogleUserDto, UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly model: Model<User, UserKey>,
  ) {}

  async findAll(currentUser: User): Promise<GenericResponse<User[]>> {
    try {
      const users = await this.model
        .scan()
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .exec();
      return new GenericResponse(
        users.map((user) => {
          const userData = user.serialize('frontend') as User;
          return userData;
        }),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string, currentUser: User): Promise<GenericResponse<User>> {
    try {
      const user = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .exec();
      if (!user || user.length === 0) {
        throw new Error('MS007');
      }
      const userData = user[0].toJSON() as User;
      delete userData.password;
      return new GenericResponse(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOneByEmail(
    email: string,
    currentUser: User,
  ): Promise<GenericResponse<User>> {
    try {
      const users = await this.model
        .scan()
        .where('email')
        .eq(email.toLowerCase())
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
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

  async create(
    body: CreateUserDto,
    currentUser: User,
  ): Promise<GenericResponse<User>> {
    try {
      // Check if user already exists by email (only if email is provided)
      if (body.email) {
        const existingEmail = await this.model
          .scan()
          .where('email')
          .eq(body.email.toLowerCase())
          .exec();

        if (existingEmail && existingEmail.length > 0) {
          throw new Error('MS005');
        }
      }

      // Create the user
      // businessInfoId is only assigned when a business is created, not when a user is created
      const now = new Date();
      const newUser = await this.model.create({
        id: uuidv4(),
        firstName: body.firstName,
        lastName: body.lastName || '',
        email: body.email ? body.email.toLowerCase() : '',
        role: body.role || UserRole.employee,
        status: body.status !== undefined ? body.status : true,
        documentType: body.documentType || '',
        documentNumber: body.documentNumber || '',
        isVerified: false,
        createdAt: now,
        updatedAt: now,
        // businessInfoId is only assigned when a business is created
        businessInfoId: body.businessInfoId || undefined,
        apiKey: encrypt(uuidv4()),
      });

      const userData = newUser.serialize('frontend') as User;
      return new GenericResponse<User>(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<GenericResponse<User>> {
    try {
      // Get current user to check existing data
      const currentUserResult = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .exec();

      if (!currentUserResult || currentUserResult.length === 0) {
        throw new Error('MS007');
      }

      if (
        updateUserDto.email &&
        currentUserResult[0].email !== updateUserDto.email
      ) {
        const currentEmailResult = await this.model
          .scan()
          .where('email')
          .eq(updateUserDto.email)
          .exec();

        if (currentEmailResult && currentEmailResult.length > 0) {
          throw new Error('MS005');
        }
      }
      const updateData = deleteEmptyProperties(updateUserDto);
      // Encrypt password if it's being updated
      if (updateUserDto.password) {
        updateData.password = encrypt(updateUserDto.password);
      }
      const updatedUser = await this.model.update({ id }, updateData);
      const userData = updatedUser.serialize('frontend') as User;
      return new GenericResponse(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async createGoogleUser(
    body: CreateGoogleUserDto,
  ): Promise<GenericResponse<User>> {
    try {
      const newUser = await this.model.create({
        id: uuidv4(),
        firstName: body.firstName,
        lastName: body.lastName || '',
        email: body.email.toLowerCase(),
        role: UserRole.customer,
        status: true,
        documentType: '',
        documentNumber: '',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        apiKey: encrypt(uuidv4()),
      });

      const userData = newUser.serialize('frontend') as User;
      return new GenericResponse<User>(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateGoogleUser(
    id: string,
    updateUserDto: UpdateGoogleUserDto,
  ): Promise<GenericResponse<User>> {
    try {
      const updatedUser = await this.model.update(
        { id },
        {
          googleId: updateUserDto.googleId,
          isVerified: updateUserDto.isVerified,
          profilePicture: updateUserDto.profilePicture,
        },
      );
      const userData = updatedUser?.serialize('frontend') as User;
      return new GenericResponse<User>(userData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findEmployeesPublic(
    businessId: string,
  ): Promise<GenericResponse<User[]>> {
    try {
      const users = await this.model
        .scan()
        .where('businessInfoId')
        .eq(businessId)
        .where('role')
        .in([UserRole.employee])
        .where('status')
        .eq(true)
        .exec();

      return new GenericResponse(
        users.map((user) => {
          const userData = user.serialize('frontend') as User;
          return userData;
        }),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string, currentUser: User): Promise<GenericResponse<void>> {
    try {
      const user = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .exec();
      if (!user || user.length === 0) {
        throw new Error('MS007');
      }
      await this.model.update({ id }, { status: false });
      return new GenericResponse(undefined);
    } catch (error) {
      throw handleError(error);
    }
  }
}
