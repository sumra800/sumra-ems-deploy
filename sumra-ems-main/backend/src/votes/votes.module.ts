import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { Vote } from './entities/vote.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Election } from '../elections/entities/election.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Candidate, Election, User])],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService, TypeOrmModule],
})
export class VotesModule {}
