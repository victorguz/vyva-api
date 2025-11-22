import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 as uuidv4 } from 'uuid';

import { UserRole } from '../../core/constants/domain.constants';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Domain, DomainKey } from '../../schemas/domain.schema';
import { User } from '../../schemas/user.schema';
import { handleError } from '../../shared/error.functions';
import { deleteEmptyProperties } from '../../shared/shared.functions';
import { CreateDomainDto, ListDomainDto, UpdateDomainDto } from './dto/domains.dto';

@Injectable()
export class DomainsService {
  constructor(
    @InjectModel('Domain')
    private readonly domainModel: Model<Domain, DomainKey>,
  ) {}

  async findAll(
    query: ListDomainDto,
    currentUser: User,
  ): Promise<GenericResponse<Domain[]>> {
    try {
      // Non-superadmins can only see their business domains
      if (
        currentUser.role !== UserRole.superadmin &&
        !currentUser.businessInfoId
      ) {
        throw new Error('MS007'); // Not found
      }

      let domains;

      // Superadmin can see all domains, others only see their business
      const businessInfoId =
        currentUser.role === UserRole.superadmin
          ? null
          : currentUser.businessInfoId;

      // Build query based on filters
      if (businessInfoId) {
        // Filter by user's businessInfoId
        domains = await this.domainModel
          .scan()
          .where('businessInfoId')
          .eq(businessInfoId)
          .exec();
      } else {
        // Superadmin sees all
        domains = await this.domainModel.scan().exec();
      }

      // Filter by group if specified
      let filteredDomains = domains.map((domain) => domain.toJSON() as Domain);
      if (query.group) {
        filteredDomains = filteredDomains.filter(
          (domain) => domain.group === query.group,
        );
      }

      // Filter by isActive if specified
      if (query.isActive !== undefined) {
        filteredDomains = filteredDomains.filter(
          (domain) => domain.isActive === query.isActive,
        );
      }

      // Sort by order and name
      filteredDomains.sort((a, b) => {
        if ((a.order || 0) !== (b.order || 0)) {
          return (a.order || 0) - (b.order || 0);
        }
        return a.name.localeCompare(b.name);
      });

      return new GenericResponse(filteredDomains);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(
    id: string,
    currentUser: User,
  ): Promise<GenericResponse<Domain>> {
    try {
      const domain = await this.domainModel.get({ id });
      if (!domain) {
        throw new Error('MS007');
      }

      const domainData = domain.toJSON() as Domain;

      // Check permissions
      if (
        currentUser.role !== UserRole.superadmin &&
        domainData.businessInfoId !== currentUser.businessInfoId
      ) {
        throw new Error('MS019'); // Unauthorized
      }

      return new GenericResponse(domainData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async create(
    body: CreateDomainDto,
    currentUser: User,
  ): Promise<GenericResponse<Domain>> {
    try {
      // Users must have a businessInfoId to create domains
      if (!currentUser.businessInfoId) {
        throw new Error('MS019'); // Unauthorized
      }

      const now = new Date();
      const domainObj = deleteEmptyProperties({
        id: uuidv4(),
        businessInfoId: currentUser.businessInfoId, // Always use authenticated user's businessInfoId
        name: body.name,
        group: body.group,
        value: body.value,
        description: body.description,
        isActive: body.isActive !== undefined ? body.isActive : true,
        order: body.order || 0,
        createdAt: now,
        updatedAt: now,
      });

      const newDomain = await this.domainModel.create(domainObj);
      const domainData = newDomain.toJSON() as Domain;
      return new GenericResponse(domainData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateDomainDto: UpdateDomainDto,
    currentUser: User,
  ): Promise<GenericResponse<Domain>> {
    try {
      // Get current domain to check permissions
      const currentDomain = await this.domainModel.get({ id });
      if (!currentDomain) {
        throw new Error('MS007');
      }

      const domainData = currentDomain.toJSON() as Domain;

      // Check permissions
      if (
        currentUser.role !== UserRole.superadmin &&
        domainData.businessInfoId !== currentUser.businessInfoId
      ) {
        throw new Error('MS019'); // Unauthorized
      }

      const updateData = deleteEmptyProperties(updateDomainDto);
      const updatedDomain = await this.domainModel.update({ id }, updateData);
      const updatedDomainData = updatedDomain.toJSON() as Domain;
      return new GenericResponse(updatedDomainData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(
    id: string,
    currentUser: User,
  ): Promise<GenericResponse<Domain>> {
    try {
      const domain = await this.domainModel.get({ id });
      if (!domain) {
        throw new Error('MS007');
      }

      const domainData = domain.toJSON() as Domain;

      // Check permissions
      if (
        currentUser.role !== UserRole.superadmin &&
        domainData.businessInfoId !== currentUser.businessInfoId
      ) {
        throw new Error('MS019'); // Unauthorized
      }

      // Deactivate instead of deleting
      const updatedDomain = await this.domainModel.update(
        { id },
        { isActive: false },
      );
      const updatedDomainData = updatedDomain.toJSON() as Domain;
      return new GenericResponse(updatedDomainData);
    } catch (error) {
      throw handleError(error);
    }
  }
}
