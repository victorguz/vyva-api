import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { File } from '../../schemas/file.schema';
import { User } from '../../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BusinessIdGuard } from '../auth/guards/businessId.guard';
import { CreateFileDto, ListFileDto, UpdateFileDto, UploadFileDto } from './dto/files.dto';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
@UseGuards(AuthGuard, BusinessIdGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new file record' })
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully created.',
    type: GenericResponse<File>,
  })
  async create(
    @Body() createFileDto: CreateFileDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<File>> {
    return this.filesService.create(createFileDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({
    status: 200,
    description: 'Return all files.',
    type: GenericResponse<[File]>,
  })
  async findAll(
    @Query() query: ListFileDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<File[]>> {
    if (query.folder) {
      return this.filesService.findAllByFolder(query.folder, currentUser);
    }
    return this.filesService.findAll(currentUser);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file directly to S3' })
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded.',
    type: GenericResponse<File>,
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: 'public' | 'private',
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<File>> {
    if (!file) {
      throw new Error('File is required');
    }
    if (!folder || (folder !== 'public' && folder !== 'private')) {
      throw new Error('Folder must be either "public" or "private"');
    }
    return this.filesService.uploadFile(file, folder, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a file by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the file.',
    type: GenericResponse<File>,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<File>> {
    return this.filesService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a file' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully updated.',
    type: GenericResponse<File>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<File>> {
    return this.filesService.update(id, updateFileDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully deleted.',
    type: GenericResponse<void>,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<GenericResponse<void>> {
    return this.filesService.remove(id, currentUser);
  }
}

