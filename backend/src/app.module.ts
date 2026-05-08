import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConstituenciesModule } from './constituencies/constituencies.module';
import { PartiesModule } from './parties/parties.module';
import { CandidatesModule } from './candidates/candidates.module';
import { ElectionsModule } from './elections/elections.module';
import { VotesModule } from './votes/votes.module';

import { User } from './users/entities/user.entity';
import { Constituency } from './constituencies/entities/constituency.entity';
import { Party } from './parties/entities/party.entity';
import { Candidate } from './candidates/entities/candidate.entity';
import { Election } from './elections/entities/election.entity';
import { Vote } from './votes/entities/vote.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CitiesModule } from './cities/cities.module';
import { City } from './cities/entities/city.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User, Constituency, Party, Candidate, Election, Vote, City],
        synchronize: true, // Auto-create tables in development
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ConstituenciesModule,
    PartiesModule,
    CandidatesModule,
    ElectionsModule,
    VotesModule,
    CloudinaryModule,
    CitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
