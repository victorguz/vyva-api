import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { User } from '../../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BusinessIdGuard } from '../auth/guards/businessId.guard';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('public/business/:businessId/employees')
  @ApiOperation({ summary: 'Get all employees by business ID (public)' })
  @ApiResponse({
    status: 200,
    description: 'Return all employees for a business.',
    type: GenericResponse<[User]>,
  })
  async findEmployeesPublic(
    @Param('businessId') businessId: string,
  ): Promise<GenericResponse<User[]>> {
    return this.usersService.findEmployeesPublic(businessId);
  }

  @Post()
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: GenericResponse<User>,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<User>> {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users.',
    type: GenericResponse<[User]>,
  })
  async findAll(
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<User[]>> {
    return this.usersService.findAll(currentUser);
  }

  @Get(':id')
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the user.',
    type: GenericResponse<User>,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<User>> {
    return this.usersService.findOne(id, currentUser);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: GenericResponse<User>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<User>> {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    type: GenericResponse<void>,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<void>> {
    return this.usersService.remove(id, currentUser);
  }
}
