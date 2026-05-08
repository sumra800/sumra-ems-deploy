import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { Candidate } from './entities/candidate.entity';
import { User } from '../users/entities/user.entity';
import { Party } from '../parties/entities/party.entity';
import { Constituency } from '../constituencies/entities/constituency.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, User, Party, Constituency]), CloudinaryModule],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService, TypeOrmModule],
})
export class CandidatesModule {}
