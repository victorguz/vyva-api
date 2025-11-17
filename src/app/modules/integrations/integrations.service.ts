import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { User } from 'src/app/schemas/user.schema';
import { decrypt, encrypt } from 'src/app/shared/shared.functions';
import { v4 as uuidv4 } from 'uuid';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Integration, IntegrationKey, IntegrationType } from '../../schemas/integration.schema';
import { handleError } from '../../shared/error.functions';
import { deleteEmptyProperties } from '../../shared/shared.functions';
import { CreateIntegrationDto, ListIntegrationDto, UpdateIntegrationDto } from './dto/integrations.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectModel('Integration')
    private readonly model: Model<Integration, IntegrationKey>,
  ) {}

  async create(
    body: CreateIntegrationDto,
    user: User,
  ): Promise<GenericResponse<Integration>> {
    try {
      // Check if integration of this type already exists for this business
      const existingIntegration = await this.model
        .scan()
        .where('type')
        .eq(body.type)
        .where('businessInfoId')
        .eq(user.businessInfoId)
        .exec();

      if (existingIntegration && existingIntegration.length > 0) {
        // Update existing integration instead of creating a new one
        const existing = existingIntegration[0].toJSON() as Integration;
        return this.update(
          existing.id,
          { data: body.data, isActive: true },
          user,
        );
      }

      // Encrypt the data before storing
      const encryptedData = encrypt(JSON.stringify(body.data));

      const integrationObj = deleteEmptyProperties({
        id: uuidv4(),
        type: body.type,
        userId: user.id,
        businessInfoId: user.businessInfoId,
        data: encryptedData,
        isActive: true,
      });

      const newIntegration = await this.model.create(integrationObj);
      const integrationData = newIntegration.toJSON() as Integration;

      // Decrypt data before returning to client
      const decryptedData = JSON.parse(decrypt(integrationData.data));
      return new GenericResponse({
        ...integrationData,
        data: decryptedData,
      } as any);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findAll(
    user: User,
    filters?: ListIntegrationDto,
  ): Promise<GenericResponse<Integration[]>> {
    try {
      let query = this.model.scan();

      // Always filter by business
      query = query.where('businessInfoId').eq(user.businessInfoId);

      // Apply optional filters
      if (filters?.type) {
        query = query.where('type').eq(filters.type);
      }

      // Note: Integrations are shared at business level, not user level
      // If userId filter is provided, filter by it, otherwise show all business integrations
      if (filters?.userId) {
        query = query.where('userId').eq(filters.userId);
      }

      const integrations = (await query.exec()).map(
        (integration) => integration.toJSON() as Integration,
      );

      // Decrypt data for each integration
      const decryptedIntegrations = integrations.map((integration) => {
        try {
          const decryptedData = JSON.parse(decrypt(integration.data));
          return {
            ...integration,
            data: decryptedData,
          } as any;
        } catch (error) {
          // If decryption fails, return integration without data
          return {
            ...integration,
            data: null,
          } as any;
        }
      });

      return new GenericResponse(decryptedIntegrations);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string, user: User): Promise<GenericResponse<Integration>> {
    try {
      const integration = await this.model.get({ id });
      if (!integration) {
        throw new Error('MS007');
      }

      const integrationData = integration.toJSON() as Integration;

      // Verify integration belongs to the business
      if (integrationData.businessInfoId !== user.businessInfoId) {
        throw new Error('MS007'); // Not found (for security)
      }

      // Decrypt data before returning
      const decryptedData = JSON.parse(decrypt(integrationData.data));
      return new GenericResponse({
        ...integrationData,
        data: decryptedData,
      } as any);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findByType(
    type: IntegrationType,
    user: User,
  ): Promise<GenericResponse<Integration | null>> {
    try {
      const integrations = await this.model
        .scan()
        .where('type')
        .eq(type)
        .where('businessInfoId')
        .eq(user.businessInfoId)
        .where('isActive')
        .eq(true)
        .exec();

      if (!integrations || integrations.length === 0) {
        return new GenericResponse(null);
      }

      const integrationData = integrations[0].toJSON() as Integration;

      // Decrypt data before returning
      const decryptedData = JSON.parse(decrypt(integrationData.data));
      return new GenericResponse({
        ...integrationData,
        data: decryptedData,
      } as any);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateIntegrationDto: UpdateIntegrationDto,
    user: User,
  ): Promise<GenericResponse<Integration>> {
    try {
      const existingIntegration = await this.model.get({ id });
      if (!existingIntegration) {
        throw new Error('MS007');
      }

      const existingIntegrationData =
        existingIntegration.toJSON() as Integration;
      if (existingIntegrationData.businessInfoId !== user.businessInfoId) {
        throw new Error('MS007'); // Not found (for security)
      }

      const updateData: any = {};

      if (updateIntegrationDto.data !== undefined) {
        // Encrypt the data before storing
        updateData.data = encrypt(JSON.stringify(updateIntegrationDto.data));
      }

      if (updateIntegrationDto.isActive !== undefined) {
        updateData.isActive = updateIntegrationDto.isActive;
      }

      const cleanedUpdateData = deleteEmptyProperties(updateData);

      if (Object.keys(cleanedUpdateData).length === 0) {
        // No changes to make, return existing integration
        const decryptedData = JSON.parse(decrypt(existingIntegrationData.data));
        return new GenericResponse({
          ...existingIntegrationData,
          data: decryptedData,
        } as any);
      }

      await this.model.update({ id }, cleanedUpdateData);
      const updatedIntegration = await this.model.get({ id });
      if (!updatedIntegration) {
        throw new Error('MS007');
      }

      const integrationData = updatedIntegration.toJSON() as Integration;

      // Decrypt data before returning
      const decryptedData = JSON.parse(decrypt(integrationData.data));
      return new GenericResponse({
        ...integrationData,
        data: decryptedData,
      } as any);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string, user: User): Promise<GenericResponse<boolean>> {
    try {
      const integration = await this.model.get({ id });
      if (!integration) {
        throw new Error('MS007');
      }

      const integrationData = integration.toJSON() as Integration;
      if (integrationData.businessInfoId !== user.businessInfoId) {
        throw new Error('MS007'); // Not found (for security)
      }

      await this.model.delete({ id });
      return new GenericResponse(true);
    } catch (error) {
      throw handleError(error);
    }
  }
}
