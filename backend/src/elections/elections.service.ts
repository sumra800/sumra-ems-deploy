import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Election, ElectionStatus } from './entities/election.entity';
import { Vote } from '../votes/entities/vote.entity';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private electionsRepository: Repository<Election>,
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async create(createElectionDto: CreateElectionDto): Promise<Election> {
    const election = this.electionsRepository.create({
      ...createElectionDto,
      startTime: createElectionDto.startTime ? new Date(createElectionDto.startTime) : undefined,
      endTime: createElectionDto.endTime ? new Date(createElectionDto.endTime) : undefined,
    });
    return this.electionsRepository.save(election);
  }

  async findAll(): Promise<Election[]> {
    return this.electionsRepository.find();
  }

  async findOne(id: string): Promise<Election> {
    const election = await this.electionsRepository.findOne({ where: { id } });
    if (!election) throw new NotFoundException(`Election #${id} not found`);
    return election;
  }

  async update(id: string, updateElectionDto: UpdateElectionDto): Promise<Election> {
    const updateData: Partial<Election> = { ...updateElectionDto as any };
    if (updateElectionDto.startTime) updateData.startTime = new Date(updateElectionDto.startTime);
    if (updateElectionDto.endTime) updateData.endTime = new Date(updateElectionDto.endTime);
    await this.electionsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: ElectionStatus): Promise<Election> {
    const election = await this.findOne(id);
    const validTransitions: Record<ElectionStatus, ElectionStatus[]> = {
      [ElectionStatus.PENDING]: [ElectionStatus.RUNNING],
      [ElectionStatus.RUNNING]: [ElectionStatus.PAUSED, ElectionStatus.COMPLETED],
      [ElectionStatus.PAUSED]: [ElectionStatus.RUNNING, ElectionStatus.COMPLETED],
      [ElectionStatus.COMPLETED]: [],
    };
    if (!validTransitions[election.status].includes(status)) {
      throw new BadRequestException(
        `Cannot transition election from ${election.status} to ${status}`,
      );
    }
    election.status = status;
    if (status === ElectionStatus.RUNNING && !election.startTime) {
      // EDGE CASE: "One election only starts if no election currently running"
      const currentlyRunning = await this.electionsRepository.findOne({
        where: { status: ElectionStatus.RUNNING },
      });
      if (currentlyRunning && currentlyRunning.id !== id) {
        throw new BadRequestException('Cannot start this election: Another election is currently running.');
      }
      election.startTime = new Date();
    }
    if (status === ElectionStatus.COMPLETED && !election.endTime) {
      election.endTime = new Date();
    }
    return this.electionsRepository.save(election);
  }

  async getResults(id: string): Promise<any> {
    const election = await this.electionsRepository.findOne({ where: { id } });
    if (!election) throw new NotFoundException(`Election #${id} not found`);

    const votes = await this.votesRepository.find({
      where: { election: { id } },
      relations: [
        'candidate',
        'candidate.user',
        'candidate.party',
        'candidate.constituency',
        'candidate.constituency.city',
      ],
    });

    const tally = new Map<string, { candidate: any; count: number }>();
    for (const vote of votes) {
      const cId = vote.candidate.id;
      if (!tally.has(cId)) {
        tally.set(cId, { candidate: vote.candidate, count: 0 });
      }
      tally.get(cId)!.count++;
    }

    const results = Array.from(tally.values()).sort((a, b) => b.count - a.count);
    return {
      election: { id: election.id, title: election.title, status: election.status },
      totalVotes: votes.length,
      results,
    };
  }

  async remove(id: string): Promise<void> {
    const election = await this.findOne(id);
    await this.electionsRepository.remove(election);
  }
}
