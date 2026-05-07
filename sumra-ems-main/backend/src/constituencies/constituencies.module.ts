import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstituenciesService } from './constituencies.service';
import { ConstituenciesController } from './constituencies.controller';
import { Constituency } from './entities/constituency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Constituency])],
  controllers: [ConstituenciesController],
  providers: [ConstituenciesService],
  exports: [ConstituenciesService, TypeOrmModule],
})
export class ConstituenciesModule {}
