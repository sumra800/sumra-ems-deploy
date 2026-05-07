import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const existing = await this.partiesRepository.findOne({ where: { name: createPartyDto.name } });
    if (existing) {
      throw new ConflictException(`Party with name "${createPartyDto.name}" already exists`);
    }
    const party = this.partiesRepository.create(createPartyDto);
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
    await this.partiesRepository.update(id, updatePartyDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const party = await this.findOne(id);
    await this.partiesRepository.remove(party);
  }
}
