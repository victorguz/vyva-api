import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/app/schemas/user.schema';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Business } from '../../schemas/business.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/businesses.dto';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get('public/slug/:slug')
  @ApiOperation({ summary: 'Get a business by slug (public)' })
  @ApiResponse({
    status: 200,
    description: 'Return the business.',
    type: GenericResponse<Business>,
  })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<GenericResponse<Business>> {
    return this.businessesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({
    status: 201,
    description: 'The business has been successfully created.',
    type: GenericResponse<Business>,
  })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Business>> {
    return this.businessesService.create(createBusinessDto, currentUser);
  }

  @Get('all')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all businesses (superadmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Return all businesses.',
    type: GenericResponse<[Business]>,
  })
  async findAll(
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Business[]>> {
    return this.businessesService.findAll(currentUser);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current user business' })
  @ApiResponse({
    status: 200,
    description: 'Return the current user business.',
    type: GenericResponse<Business>,
  })
  async getBusiness(
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Business>> {
    return this.businessesService.getBusiness(currentUser);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get a business by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the business.',
    type: GenericResponse<Business>,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Business>> {
    return this.businessesService.findOne(id, currentUser);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a business' })
  @ApiResponse({
    status: 200,
    description: 'The business has been successfully updated.',
    type: GenericResponse<Business>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Business>> {
    return this.businessesService.update(id, updateBusinessDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Deactivate a business (superadmin only)' })
  @ApiResponse({
    status: 200,
    description: 'The business has been successfully deactivated.',
    type: GenericResponse<Business>,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Business>> {
    return this.businessesService.remove(id, currentUser);
  }
}
