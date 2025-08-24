import { Injectable } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UpdateProfileDto } from './dto/profile.dto';
import { handleError } from '../../shared/error.functions';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfileService {
  constructor(private readonly usersService: UsersService) {}

  async getProfile(user: User): Promise<GenericResponse<User>> {
    try {
      const userResponse = await this.usersService.findOne(user.id);
      return userResponse;
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateProfile(
    user: User,
    updateProfileDto: UpdateProfileDto,
  ): Promise<GenericResponse<User>> {
    try {
      // Filter out undefined values to avoid schema validation issues
      const updateData = Object.fromEntries(
        Object.entries(updateProfileDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );
      const updatedUser = await this.usersService.update(user.id, updateData);

      return updatedUser;
    } catch (error) {
      throw handleError(error);
    }
  }
}
