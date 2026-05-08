import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constituency } from './entities/constituency.entity';
import { CreateConstituencyDto } from './dto/create-constituency.dto';
import { UpdateConstituencyDto } from './dto/update-constituency.dto';
import { City } from '../cities/entities/city.entity';

@Injectable()
export class ConstituenciesService {
  constructor(
    @InjectRepository(Constituency)
    private constituenciesRepository: Repository<Constituency>,
    @InjectRepository(City)
    private citiesRepository: Repository<City>,
  ) {}

  async create(createConstituencyDto: CreateConstituencyDto): Promise<Constituency> {
    const city = await this.citiesRepository.findOne({ where: { id: createConstituencyDto.cityId } });
    if (!city) throw new NotFoundException(`City #${createConstituencyDto.cityId} not found`);

    const constituency = this.constituenciesRepository.create({
      name: createConstituencyDto.name,
      region: createConstituencyDto.region,
      city,
    });
    return this.constituenciesRepository.save(constituency);
  }

  async findAll(): Promise<Constituency[]> {
    return this.constituenciesRepository.find({ relations: ['candidates', 'city'] });
  }

  async findOne(id: string): Promise<Constituency> {
    const constituency = await this.constituenciesRepository.findOne({
      where: { id },
      relations: ['city', 'candidates', 'candidates.user', 'candidates.party'],
    });
    if (!constituency) {
      throw new NotFoundException(`Constituency #${id} not found`);
    }
    return constituency;
  }

  async update(id: string, updateConstituencyDto: UpdateConstituencyDto): Promise<Constituency> {
    const constituency = await this.findOne(id);

    if (updateConstituencyDto.name !== undefined) {
      constituency.name = updateConstituencyDto.name;
    }
    if (updateConstituencyDto.region !== undefined) {
      constituency.region = updateConstituencyDto.region;
    }
    if (updateConstituencyDto.cityId !== undefined) {
      const city = await this.citiesRepository.findOne({ where: { id: updateConstituencyDto.cityId } });
      if (!city) throw new NotFoundException(`City #${updateConstituencyDto.cityId} not found`);
      constituency.city = city;
    }

    await this.constituenciesRepository.save(constituency);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const constituency = await this.findOne(id);
    await this.constituenciesRepository.remove(constituency);
  }
}
