import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constituency } from './entities/constituency.entity';
import { CreateConstituencyDto } from './dto/create-constituency.dto';
import { UpdateConstituencyDto } from './dto/update-constituency.dto';

@Injectable()
export class ConstituenciesService {
  constructor(
    @InjectRepository(Constituency)
    private constituenciesRepository: Repository<Constituency>,
  ) {}

  async create(createConstituencyDto: CreateConstituencyDto): Promise<Constituency> {
    const constituency = this.constituenciesRepository.create(createConstituencyDto);
    return this.constituenciesRepository.save(constituency);
  }

  async findAll(): Promise<Constituency[]> {
    return this.constituenciesRepository.find({ relations: ['candidates'] });
  }

  async findOne(id: string): Promise<Constituency> {
    const constituency = await this.constituenciesRepository.findOne({
      where: { id },
      relations: ['candidates', 'candidates.user', 'candidates.party'],
    });
    if (!constituency) {
      throw new NotFoundException(`Constituency #${id} not found`);
    }
    return constituency;
  }

  async update(id: string, updateConstituencyDto: UpdateConstituencyDto): Promise<Constituency> {
    await this.constituenciesRepository.update(id, updateConstituencyDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const constituency = await this.findOne(id);
    await this.constituenciesRepository.remove(constituency);
  }
}
