import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private citiesRepository: Repository<City>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    const name = createCityDto.name.trim();
    const existingCity = await this.citiesRepository.findOne({ where: { name: ILike(name) } });
    if (existingCity) {
      throw new ConflictException('City already exists');
    }

    return this.citiesRepository.save(this.citiesRepository.create({
      name,
      province: createCityDto.province.trim(),
    }));
  }

  async findAll(): Promise<City[]> {
    return this.citiesRepository.find({
      relations: ['constituencies'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<City> {
    const city = await this.citiesRepository.findOne({
      where: { id },
      relations: ['constituencies'],
    });
    if (!city) throw new NotFoundException(`City #${id} not found`);
    return city;
  }

  async update(id: string, updateCityDto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);
    if (updateCityDto.name) {
      city.name = updateCityDto.name.trim();
    }
    if (updateCityDto.province) {
      city.province = updateCityDto.province.trim();
    }
    return this.citiesRepository.save(city);
  }

  async remove(id: string): Promise<void> {
    const city = await this.findOne(id);
    await this.citiesRepository.remove(city);
  }
}
