import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { Candidate } from './entities/candidate.entity';
import { User } from '../users/entities/user.entity';
import { Party } from '../parties/entities/party.entity';
import { Constituency } from '../constituencies/entities/constituency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, User, Party, Constituency])],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService, TypeOrmModule],
})
export class CandidatesModule {}
