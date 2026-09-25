import { Module } from '@nestjs/common';
import { FileStorageController } from './file-storage.controller';
import { GDriveService } from './gdrive.service';

@Module({ controllers: [FileStorageController], providers: [GDriveService] })
export class FileStorageModule {}
