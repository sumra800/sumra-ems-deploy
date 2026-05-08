import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartiesService } from './parties.service';
import { PartiesController } from './parties.controller';
import { Party } from './entities/party.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Party]), CloudinaryModule],
  controllers: [PartiesController],
  providers: [PartiesService],
  exports: [PartiesService, TypeOrmModule],
})
export class PartiesModule {}
