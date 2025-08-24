import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { User } from '../../schemas/user.schema';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: GenericResponse<User>,
  })
  getProfile(@CurrentUser() user: User): Promise<GenericResponse<User>> {
    return this.profileService.getProfile(user);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: GenericResponse<User>,
  })
  updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<GenericResponse<User>> {
    return this.profileService.updateProfile(user, updateProfileDto);
  }
}
