import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 as uuidv4 } from 'uuid';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { File, FileKey } from '../../schemas/file.schema';
import { User } from '../../schemas/user.schema';
import { handleError } from '../../shared/error.functions';
import { deleteEmptyProperties } from '../../shared/shared.functions';
import { S3Service } from '../../shared/s3.service';
import { CreateFileDto, UpdateFileDto } from './dto/files.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel('File')
    private readonly model: Model<File, FileKey>,
    private readonly s3Service: S3Service,
  ) {}

  async findAll(currentUser: User): Promise<GenericResponse<File[]>> {
    try {
      const files = await this.model
        .scan()
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .exec();

      return new GenericResponse(
        files.map((file) => file.toJSON() as File),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string, currentUser: User): Promise<GenericResponse<File>> {
    try {
      const files = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .exec();

      if (!files || files.length === 0) {
        throw new Error('MS007');
      }

      return new GenericResponse(files[0].toJSON() as File);
    } catch (error) {
      throw handleError(error);
    }
  }

  async create(
    body: CreateFileDto,
    currentUser: User,
  ): Promise<GenericResponse<File>> {
    try {
      const now = new Date();
      const newFile = await this.model.create({
        id: uuidv4(),
        fileName: body.fileName,
        url: body.url,
        route: body.route || body.url, // Use route if provided, otherwise extract from url
        folder: body.folder || 'private',
        mimeType: body.mimeType,
        size: body.size,
        businessInfoId: currentUser.businessInfoId,
        uploadedBy: currentUser.id,
        createdAt: now,
        updatedAt: now,
      });

      return new GenericResponse(newFile.toJSON() as File);
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Upload a file directly to S3 and save the record
   * @param file File buffer and metadata
   * @param folder Folder type: 'public' or 'private'
   * @param currentUser Current user
   * @returns File record
   */
  async uploadFile(
    file: any,
    folder: 'public' | 'private',
    currentUser: User,
  ): Promise<GenericResponse<File>> {
    try {
      const fileBuffer = Buffer.from(file.buffer);
      const fileName = file.originalname;
      const contentType = file.mimetype;

      // Generate S3 key with folder structure: businessId/folder/filename
      const key = this.s3Service.generateKey(
        currentUser.businessInfoId,
        fileName,
        folder,
      );

      // Upload to S3
      const s3Url = await this.s3Service.uploadFile(fileBuffer, key, contentType);

      // Save file record
      const now = new Date();
      const newFile = await this.model.create({
        id: uuidv4(),
        fileName,
        url: s3Url,
        route: key,
        folder,
        mimeType: contentType,
        size: file.size,
        businessInfoId: currentUser.businessInfoId,
        uploadedBy: currentUser.id,
        createdAt: now,
        updatedAt: now,
      });

      return new GenericResponse(newFile.toJSON() as File);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findAllByFolder(
    folder: 'public' | 'private',
    currentUser: User,
  ): Promise<GenericResponse<File[]>> {
    try {
      const files = await this.model
        .scan()
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .and()
        .where('folder')
        .eq(folder)
        .exec();

      return new GenericResponse(
        files.map((file) => file.toJSON() as File),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateFileDto: UpdateFileDto,
    currentUser: User,
  ): Promise<GenericResponse<File>> {
    try {
      // Check if file exists and belongs to the user's business
      const files = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .exec();

      if (!files || files.length === 0) {
        throw new Error('MS007');
      }

      const updateData = deleteEmptyProperties(updateFileDto);
      const updatedFile = await this.model.update({ id }, updateData);

      return new GenericResponse(updatedFile.toJSON() as File);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string, currentUser: User): Promise<GenericResponse<void>> {
    try {
      const files = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(currentUser.businessInfoId)
        .exec();

      if (!files || files.length === 0) {
        throw new Error('MS007');
      }

      const file = files[0].toJSON() as File;

      // Delete file from S3
      try {
        // Extract the key from the S3 URL
        const key = this.s3Service.extractKeyFromUrl(file.url);
        await this.s3Service.deleteFile(key);
      } catch (s3Error) {
        // Log error but continue with database deletion
        console.error('Failed to delete file from S3:', s3Error);
      }

      // Delete file record from database
      await this.model.delete({ id });

      return new GenericResponse(undefined);
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Upload a file from a URL to S3 and save the record
   * @param url URL of the file to download
   * @param fileName Name for the file
   * @param businessId Business ID to organize the file
   * @param userId User ID who uploaded the file
   * @param prefix Optional prefix for the S3 key (e.g., 'profile-pictures')
   * @returns File record
   */
  async uploadFileFromUrl(
    url: string,
    fileName: string,
    businessId: string,
    userId: string,
    prefix?: string,
  ): Promise<File> {
    try {
      // Download file from URL
      const { buffer, contentType } = await this.s3Service.downloadFileFromUrl(url);

      // Generate S3 key with folder (default to private)
      const key = this.s3Service.generateKey(businessId, fileName, 'private', prefix);

      // Upload to S3
      const s3Url = await this.s3Service.uploadFile(buffer, key, contentType);

      // Save file record
      const now = new Date();
      const newFile = await this.model.create({
        id: uuidv4(),
        fileName,
        url: s3Url,
        route: key,
        folder: 'private', // Default to private for URL uploads
        mimeType: contentType,
        size: buffer.length,
        businessInfoId: businessId,
        uploadedBy: userId,
        createdAt: now,
        updatedAt: now,
      });

      return newFile.toJSON() as File;
    } catch (error) {
      throw handleError(error);
    }
  }
}

