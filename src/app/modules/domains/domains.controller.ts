import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Domain } from '../../schemas/domain.schema';
import { User } from '../../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DomainsService } from './domains.service';
import { CreateDomainDto, ListDomainDto, UpdateDomainDto } from './dto/domains.dto';

@ApiTags('Domains')
@Controller('domains')
@UseGuards(AuthGuard)
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all domains with optional filters' })
  @ApiResponse({ status: 200, description: 'Returns all domains' })
  async findAll(
    @Query() query: ListDomainDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Domain[]>> {
    return this.domainsService.findAll(query, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a domain by ID' })
  @ApiResponse({ status: 200, description: 'Returns a domain' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Domain>> {
    return this.domainsService.findOne(id, currentUser);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new domain' })
  @ApiResponse({ status: 201, description: 'Domain created successfully' })
  async create(
    @Body() body: CreateDomainDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Domain>> {
    return this.domainsService.create(body, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a domain' })
  @ApiResponse({ status: 200, description: 'Domain updated successfully' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDomainDto: UpdateDomainDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Domain>> {
    return this.domainsService.update(id, updateDomainDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a domain' })
  @ApiResponse({ status: 200, description: 'Domain deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<Domain>> {
    return this.domainsService.remove(id, currentUser);
  }
}

