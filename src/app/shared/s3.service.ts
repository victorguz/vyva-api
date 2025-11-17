import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const region = this.configService.get<string>('REGION') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('SECRET_ACCESS_KEY');

    this.s3Client = new S3Client({
      region,
      credentials: accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
          }
        : undefined,
    });

    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
  }

  /**
   * Upload a file to S3
   * @param fileBuffer File buffer to upload
   * @param key S3 key (path) where the file will be stored
   * @param contentType MIME type of the file
   * @returns S3 URL of the uploaded file
   */
  async uploadFile(
    fileBuffer: Buffer,
    key: string,
    contentType?: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      // Return the S3 URL
      return `https://${this.bucketName}.s3.${this.configService.get<string>('REGION') || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }


  /**
   * Delete a file from S3
   * @param key S3 key (path) of the file to delete
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Generate S3 key (path) for a file based on businessId
   * @param businessId Business ID
   * @param fileName File name
   * @param prefix Optional prefix (e.g., 'profile-pictures', 'documents')
   * @returns S3 key
   */
  generateKey(businessId: string, fileName: string, prefix?: string): string {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (prefix) {
      return `${businessId}/${prefix}/${sanitizedFileName}`;
    }
    return `${businessId}/${sanitizedFileName}`;
  }

  /**
   * Extract S3 key from S3 URL
   * @param s3Url S3 URL (e.g., https://bucket.s3.region.amazonaws.com/key)
   * @returns S3 key
   */
  extractKeyFromUrl(s3Url: string): string {
    try {
      // S3 URL format: https://bucket.s3.region.amazonaws.com/key
      const url = new URL(s3Url);
      // Remove leading slash from pathname
      return url.pathname.substring(1);
    } catch (error) {
      // Fallback: try to extract key manually
      const match = s3Url.match(/\.amazonaws\.com\/(.+)$/);
      if (match && match[1]) {
        return match[1];
      }
      throw new Error(`Failed to extract key from S3 URL: ${s3Url}`);
    }
  }

  /**
   * Download a file from a URL and return it as a Buffer
   * @param url URL of the file to download
   * @returns File buffer and content type
   */
  async downloadFileFromUrl(url: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          responseType: 'arraybuffer',
        }),
      );

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'application/octet-stream';

      return { buffer, contentType };
    } catch (error) {
      throw new Error(`Failed to download file from URL: ${error.message}`);
    }
  }
}

