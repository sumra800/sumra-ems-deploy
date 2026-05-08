import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Party } from '../parties/entities/party.entity';
import { Constituency } from '../constituencies/entities/constituency.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Party)
    private partiesRepository: Repository<Party>,
    @InjectRepository(Constituency)
    private constituenciesRepository: Repository<Constituency>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    const user = await this.usersRepository.findOne({ where: { id: createCandidateDto.userId } });
    if (!user) throw new NotFoundException(`User #${createCandidateDto.userId} not found`);

    const constituency = await this.constituenciesRepository.findOne({
      where: { id: createCandidateDto.constituencyId },
    });
    if (!constituency) throw new NotFoundException(`Constituency #${createCandidateDto.constituencyId} not found`);

    const existingCandidate = await this.candidatesRepository.findOne({ where: { user: { id: user.id } } });
    if (existingCandidate) {
      throw new BadRequestException('This user is already registered as a candidate');
    }

    const candidate = this.candidatesRepository.create({
      user,
      constituency,
      photoUrl: createCandidateDto.photoUrl ?? user.photoUrl,
    });

    if (createCandidateDto.partyId) {
      const party = await this.partiesRepository.findOne({ where: { id: createCandidateDto.partyId } });
      if (!party) throw new NotFoundException(`Party #${createCandidateDto.partyId} not found`);
      candidate.party = party;
      candidate.photoUrl = party.logoUrl;
    }

    return this.candidatesRepository.save(candidate);
  }

  async findAll(): Promise<Candidate[]> {
    return this.candidatesRepository.find({
      relations: ['user', 'party', 'constituency', 'constituency.city'],
    });
  }

  async findAllForUser(user: User): Promise<Candidate[]> {
    if (user.role === UserRole.ADMIN) {
      return this.findAll();
    }

    const voter = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['city', 'constituency', 'constituency.city'],
    });

    if (!voter) {
      return [];
    }

    const voterCityId = voter.city?.id ?? voter.constituency?.city?.id;

    const query = this.candidatesRepository.createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.user', 'user')
      .leftJoinAndSelect('candidate.party', 'party')
      .leftJoinAndSelect('candidate.constituency', 'constituency')
      .leftJoinAndSelect('constituency.city', 'city');

    if (voterCityId) {
      query.where('city.id = :cityId', { cityId: voterCityId });
    } else if (voter.constituency) {
      query.where('constituency.id = :constituencyId', { constituencyId: voter.constituency.id });
    } else {
      return [];
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({
      where: { id },
      relations: ['user', 'party', 'constituency'],
    });
    if (!candidate) throw new NotFoundException(`Candidate #${id} not found`);
    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = await this.findOne(id);

    if (updateCandidateDto.constituencyId) {
      const constituency = await this.constituenciesRepository.findOne({
        where: { id: updateCandidateDto.constituencyId },
      });
      if (!constituency) throw new NotFoundException(`Constituency #${updateCandidateDto.constituencyId} not found`);
      candidate.constituency = constituency;
    }

    if (updateCandidateDto.partyId) {
      const party = await this.partiesRepository.findOne({ where: { id: updateCandidateDto.partyId } });
      if (!party) throw new NotFoundException(`Party #${updateCandidateDto.partyId} not found`);
      candidate.party = party;
      candidate.photoUrl = party.logoUrl;
    }

    if (updateCandidateDto.photoUrl !== undefined) {
      candidate.photoUrl = updateCandidateDto.photoUrl;
    }

    return this.candidatesRepository.save(candidate);
  }

  async remove(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidatesRepository.remove(candidate);
  }
}
