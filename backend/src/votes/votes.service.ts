import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { User } from '../users/entities/user.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Election, ElectionStatus } from '../elections/entities/election.entity';
import { CastVoteDto } from './dto/cast-vote.dto';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
    @InjectRepository(Election)
    private electionsRepository: Repository<Election>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async castVote(user: User, castVoteDto: CastVoteDto): Promise<Vote> {
    const election = await this.electionsRepository.findOne({ where: { id: castVoteDto.electionId } });
    if (!election) throw new NotFoundException('Election not found');
    if (election.status !== ElectionStatus.RUNNING) {
      throw new BadRequestException('Election is not currently active');
    }

    const candidate = await this.candidatesRepository.findOne({
      where: { id: castVoteDto.candidateId },
      relations: ['constituency', 'constituency.city'],
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const voter = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['city', 'constituency'],
    });

    const canVoteByCity = voter?.city && candidate.constituency.city?.id === voter.city.id;
    const canVoteByLegacyConstituency = !voter?.city && voter?.constituency?.id === candidate.constituency.id;

    if (!canVoteByCity && !canVoteByLegacyConstituency) {
      throw new BadRequestException('You can only vote for candidates in constituencies assigned to your city');
    }

    const existingVote = await this.votesRepository.findOne({
      where: { voter: { id: user.id }, election: { id: election.id } },
    });
    if (existingVote) {
      throw new ConflictException('You have already cast your vote in this election');
    }

    const vote = this.votesRepository.create({
      voter: user,
      candidate,
      election,
    });

    return this.votesRepository.save(vote);
  }

  async findMyVotes(userId: string): Promise<Vote[]> {
    return this.votesRepository.find({
      where: { voter: { id: userId } },
      relations: ['candidate', 'candidate.user', 'candidate.party', 'election'],
    });
  }

  async hasVoted(userId: string, electionId: string): Promise<boolean> {
    const vote = await this.votesRepository.findOne({
      where: { voter: { id: userId }, election: { id: electionId } },
    });
    return !!vote;
  }
}
