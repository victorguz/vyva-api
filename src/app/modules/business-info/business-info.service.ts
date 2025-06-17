import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import {
  BusinessInfo,
  BusinessInfoKey,
} from '../../entities/business-info.entity';
import { handleError } from '../../shared/error.functions';
import { v4 as uuidv4 } from 'uuid';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import {
  CreateBusinessInfoDto,
  UpdateBusinessInfoDto,
} from './dto/business-info.dto';

@Injectable()
export class BusinessInfoService {
  constructor(
    @InjectModel('BusinessInfo')
    private readonly businessInfoModel: Model<BusinessInfo, BusinessInfoKey>,
  ) {}

  async create(
    dto: CreateBusinessInfoDto,
  ): Promise<GenericResponse<BusinessInfo>> {
    try {
      // Generate a slug if not provided
      if (!dto.slug && dto.name) {
        dto.slug = dto.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Check if slug already exists
      if (dto.slug) {
        const existingBusiness = await this.businessInfoModel
          .scan()
          .where('slug')
          .eq(dto.slug)
          .exec();

        if (existingBusiness && existingBusiness.length > 0) {
          throw new Error('MS005'); // Business with this slug already exists
        }
      }

      // Create business info
      const businessInfo = await this.businessInfoModel.create({
        id: uuidv4(),
        userId: dto.userId,
        name: dto.name,
        taxId: dto.taxId,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        logo: dto.logo,
        slug: dto.slug,
      } as BusinessInfo);

      return new GenericResponse(businessInfo);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findAll(): Promise<GenericResponse<BusinessInfo[]>> {
    try {
      const businessInfos = await this.businessInfoModel.scan().exec();
      return new GenericResponse(businessInfos);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string): Promise<GenericResponse<BusinessInfo>> {
    try {
      const businessInfo = await this.businessInfoModel.get({ id });
      if (!businessInfo) {
        throw new Error('MS007'); // Business info not found
      }
      return new GenericResponse(businessInfo);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findByUserId(userId: string): Promise<GenericResponse<BusinessInfo[]>> {
    try {
      const businessInfos = await this.businessInfoModel
        .scan()
        .where('userId')
        .eq(userId)
        .exec();
      return new GenericResponse(businessInfos);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findBySlug(slug: string): Promise<GenericResponse<BusinessInfo>> {
    try {
      const businessInfos = await this.businessInfoModel
        .scan()
        .where('slug')
        .eq(slug)
        .exec();

      if (!businessInfos || businessInfos.length === 0) {
        throw new Error('MS007'); // Business info not found
      }

      return new GenericResponse(businessInfos[0]);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateBusinessInfoDto,
  ): Promise<GenericResponse<BusinessInfo>> {
    try {
      // Check if business info exists
      const exists = await this.businessInfoModel.get({ id });
      if (!exists) {
        throw new Error('MS007'); // Business info not found
      }

      // If slug is being updated, check if it already exists
      if (dto.slug) {
        const existingBusiness = await this.businessInfoModel
          .scan()
          .where('slug')
          .eq(dto.slug)
          .exec();

        // Filter out the current record
        const conflictingBusiness = existingBusiness.filter(
          (business) => business.id !== id,
        );

        if (conflictingBusiness.length > 0) {
          throw new Error('MS005'); // Business with this slug already exists
        }
      }

      // Update business info
      await this.businessInfoModel.update({ id }, dto);

      // Get updated business info
      const updated = await this.businessInfoModel.get({ id });
      return new GenericResponse(updated);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string): Promise<GenericResponse<void>> {
    try {
      // Check if business info exists
      const exists = await this.businessInfoModel.get({ id });
      if (!exists) {
        throw new Error('MS007'); // Business info not found
      }

      // Delete business info
      await this.businessInfoModel.delete({ id });
      return new GenericResponse(undefined);
    } catch (error) {
      throw handleError(error);
    }
  }
}
