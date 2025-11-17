import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { User, UserKey } from 'src/app/schemas/user.schema';
import { deleteEmptyProperties } from 'src/app/shared/shared.functions';
import { v4 as uuidv4 } from 'uuid';

import { UserRole } from '../../core/constants/domain.constants';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Business, BusinessKey } from '../../schemas/business.schema';
import { handleError } from '../../shared/error.functions';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/businesses.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel('Business')
    private readonly businessModel: Model<Business, BusinessKey>,
    @InjectModel('User')
    private readonly userModel: Model<User, UserKey>,
  ) {}

  async findAll(currentUser: User): Promise<GenericResponse<Business[]>> {
    try {
      // Only superadmin can see all businesses
      if (currentUser.role !== UserRole.superadmin) {
        throw new Error('MS019'); // Unauthorized
      }

      const businesses = await this.businessModel.scan().exec();
      return new GenericResponse(
        businesses.map((business) => business.toJSON() as Business),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async getBusiness(currentUser: User): Promise<GenericResponse<Business>> {
    try {
      if (!currentUser.businessInfoId) {
        throw new Error('MS007'); // Not found
      }

      let business;
      try {
        business = await this.businessModel.get({
          id: currentUser.businessInfoId,
        });
      } catch (error) {
        // Business doesn't exist, create it with default values
        business = await this.createDefaultBusiness(currentUser);
      }

      if (!business) {
        // If still null, create default business
        business = await this.createDefaultBusiness(currentUser);
      }

      const businessData = business;
      return new GenericResponse(businessData);
    } catch (error) {
      throw handleError(error);
    }
  }

  private async createDefaultBusiness(currentUser: User): Promise<Business> {
    const now = new Date();
    const defaultBusiness = await this.businessModel.create({
      id: currentUser.businessInfoId,
      userId: currentUser.id,
      name: currentUser.firstName
        ? `${currentUser.firstName}'s Business`
        : 'My Business',
      slug: currentUser.email
        ? currentUser.email.split('@')[0].toLowerCase()
        : `business-${currentUser.id.substring(0, 8)}`,
      createdAt: now,
      updatedAt: now,
    });
    return defaultBusiness;
  }

  async findBySlug(slug: string): Promise<GenericResponse<Business>> {
    try {
      const businesses = await this.businessModel
        .scan()
        .where('slug')
        .eq(slug)
        .exec();

      if (!businesses || businesses.length === 0) {
        throw new Error('MS007');
      }

      const businessData = businesses[0].toJSON() as Business;
      return new GenericResponse(businessData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(
    id: string,
    currentUser: User,
  ): Promise<GenericResponse<Business>> {
    try {
      const business = await this.businessModel.get({ id });
      if (!business) {
        throw new Error('MS007');
      }

      const businessData = business.toJSON() as Business;

      // Superadmin can see any business, admin can only see their own
      if (
        currentUser.role !== UserRole.superadmin &&
        businessData.id !== currentUser.businessInfoId
      ) {
        throw new Error('MS007'); // Not found (for security)
      }

      return new GenericResponse(businessData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async create(
    body: CreateBusinessDto,
    currentUser: User,
  ): Promise<GenericResponse<Business>> {
    try {
      // Check if user already has a business
      if (currentUser.businessInfoId) {
        throw new Error('MS042'); // User already has a business
      }

      // Check for duplicate slug
      if (body.slug) {
        const existingSlug = await this.businessModel
          .scan()
          .where('slug')
          .eq(body.slug)
          .exec();

        if (existingSlug && existingSlug.length > 0) {
          throw new Error('MS041'); // Duplicate slug
        }
      }

      // Create the business
      const now = new Date();
      const businessObj = deleteEmptyProperties({
        id: uuidv4(),
        userId: currentUser.id,
        name: body.name,
        slug: body.slug,
        description: body.description,
        slogan: body.slogan,
        taxId: body.taxId,
        address: body.address,
        phone: body.phone,
        email: body.email ? body.email.toLowerCase() : undefined,
        website: body.website,
        logo: body.logo,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      const newBusiness = await this.businessModel.create(businessObj);

      // Assign businessId to the user
      await this.userModel.update(
        { id: currentUser.id },
        { businessInfoId: newBusiness.id },
      );

      const businessData = newBusiness.toJSON() as Business;
      return new GenericResponse(businessData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
    currentUser: User,
  ): Promise<GenericResponse<Business>> {
    try {
      // Get current business to check ownership
      const currentBusiness = await this.businessModel.get({ id });
      if (!currentBusiness) {
        throw new Error('MS007');
      }

      const businessData = currentBusiness.toJSON() as Business;

      // Superadmin can update any business, admin can only update their own
      if (
        currentUser.role !== UserRole.superadmin &&
        businessData.id !== currentUser.businessInfoId
      ) {
        throw new Error('MS007'); // Not found (for security)
      }

      // Check for duplicate slug if slug is being updated
      if (
        updateBusinessDto.slug &&
        updateBusinessDto.slug !== businessData.slug
      ) {
        const existingSlug = await this.businessModel
          .scan()
          .where('slug')
          .eq(updateBusinessDto.slug)
          .exec();

        if (existingSlug && existingSlug.length > 0) {
          throw new Error('MS041'); // Duplicate slug
        }
      }

      const updateData = deleteEmptyProperties(updateBusinessDto);
      const updatedBusiness = await this.businessModel.update(
        { id },
        updateData,
      );
      const updatedBusinessData = updatedBusiness.toJSON() as Business;
      return new GenericResponse(updatedBusinessData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string, currentUser: User): Promise<GenericResponse<Business>> {
    try {
      // Only superadmin can deactivate businesses
      if (currentUser.role !== UserRole.superadmin) {
        throw new Error('MS019'); // Unauthorized
      }

      const business = await this.businessModel.get({ id });
      if (!business) {
        throw new Error('MS007');
      }

      // Deactivate instead of deleting
      const updatedBusiness = await this.businessModel.update(
        { id },
        { isActive: false },
      );
      const updatedBusinessData = updatedBusiness.toJSON() as Business;
      return new GenericResponse(updatedBusinessData);
    } catch (error) {
      throw handleError(error);
    }
  }
}
