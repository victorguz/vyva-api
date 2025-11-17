import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';

import { FileSchema } from '../../schemas/file.schema';
import { SharedModule } from '../shared/shared.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [
    SharedModule,
    DynamooseModule.forFeature([
      {
        name: 'File',
        schema: FileSchema,
        options: {
          tableName: 'files',
        },
      },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}

