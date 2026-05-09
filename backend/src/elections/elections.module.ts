import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';
import { Election } from './entities/election.entity';
import { Vote } from '../votes/entities/vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Election, Vote])],
  controllers: [ElectionsController],
  providers: [ElectionsService],
  exports: [ElectionsService, TypeOrmModule],
})
export class ElectionsModule {}
