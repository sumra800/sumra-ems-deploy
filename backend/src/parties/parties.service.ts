import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Party } from './entities/party.entity';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(Party)
    private partiesRepository: Repository<Party>,
  ) {}

  async create(createPartyDto: CreatePartyDto): Promise<Party> {
    const normalizedName = createPartyDto.name.trim();
    const normalizedLeaderName = createPartyDto.leaderName?.trim();
    const existing = await this.partiesRepository.findOne({ where: { name: ILike(normalizedName) } });
    if (existing) {
      throw new ConflictException(`Party with name "${normalizedName}" already exists`);
    }
    const party = this.partiesRepository.create({
      ...createPartyDto,
      name: normalizedName,
      leaderName: normalizedLeaderName || undefined,
    });
    return this.partiesRepository.save(party);
  }

  async findAll(): Promise<Party[]> {
    return this.partiesRepository.find({ relations: ['candidates'] });
  }

  async findOne(id: string): Promise<Party> {
    const party = await this.partiesRepository.findOne({
      where: { id },
      relations: ['candidates', 'candidates.user', 'candidates.constituency'],
    });
    if (!party) {
      throw new NotFoundException(`Party #${id} not found`);
    }
    return party;
  }

  async update(id: string, updatePartyDto: UpdatePartyDto): Promise<Party> {
    const payload: UpdatePartyDto = { ...updatePartyDto };
    if (payload.name !== undefined) {
      payload.name = payload.name.trim();
    }
    if (payload.leaderName !== undefined) {
      const normalizedLeaderName = payload.leaderName.trim();
      payload.leaderName = normalizedLeaderName || undefined;
    }
    await this.partiesRepository.update(id, payload);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const party = await this.findOne(id);
    await this.partiesRepository.remove(party);
  }
}
