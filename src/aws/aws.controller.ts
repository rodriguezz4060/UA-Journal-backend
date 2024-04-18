import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const randomFilename = `${uuidv4()}-${file.originalname}`;
    return this.awsService.uploadPublicFile(
      file.buffer,
      randomFilename,
      file.mimetype,
    );
  }

  @Delete('/:key')
  async deleteFile(@Param('key') fileKey: string) {
    return this.awsService.deletePublicFile(fileKey);
  }
}
