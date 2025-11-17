import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Integration, IntegrationType } from '../../schemas/integration.schema';
import { User } from '../../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BusinessIdGuard } from '../auth/guards/businessId.guard';
import { CreateIntegrationDto, ListIntegrationDto, UpdateIntegrationDto } from './dto/integrations.dto';
import { IntegrationsService } from './integrations.service';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(AuthGuard, BusinessIdGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new integration' })
  @ApiResponse({
    status: 201,
    description: 'The integration has been successfully created.',
    type: GenericResponse<Integration>,
  })
  async create(
    @Body() createIntegrationDto: CreateIntegrationDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Integration>> {
    return this.integrationsService.create(createIntegrationDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all integrations with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Return all integrations.',
    type: GenericResponse<[Integration]>,
  })
  async findAll(
    @Query() filters: ListIntegrationDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Integration[]>> {
    return this.integrationsService.findAll(user, filters);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get integration by type' })
  @ApiResponse({
    status: 200,
    description: 'Return the integration of the specified type.',
    type: GenericResponse<Integration>,
  })
  async findByType(
    @Param('type') type: IntegrationType,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Integration | null>> {
    return this.integrationsService.findByType(type, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an integration by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the integration.',
    type: GenericResponse<Integration>,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Integration>> {
    return this.integrationsService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an integration' })
  @ApiResponse({
    status: 200,
    description: 'The integration has been successfully updated.',
    type: GenericResponse<Integration>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Integration>> {
    return this.integrationsService.update(id, updateIntegrationDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an integration' })
  @ApiResponse({
    status: 200,
    description: 'The integration has been successfully deleted.',
    type: GenericResponse<boolean>,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<boolean>> {
    return this.integrationsService.remove(id, user);
  }
}

