import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { City } from '../cities/entities/city.entity';

export interface CreateUserData {
  name: string;
  cnic: string;
  password: string;
  role?: User['role'];
  cityId?: string;
  photoUrl?: string;
  constituency?: User['constituency'];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(City)
    private citiesRepository: Repository<City>,
  ) {}

  async create(userData: CreateUserData): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { cnic: userData.cnic } });
    if (existingUser) {
      throw new ConflictException('User with this CNIC already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    let city: City | undefined;
    let constituency = userData.constituency;

    if (userData.cityId) {
      const foundCity = await this.citiesRepository.findOne({ where: { id: userData.cityId } });
      if (!foundCity) throw new NotFoundException(`City #${userData.cityId} not found`);
      city = foundCity;
    }

    const user = this.usersRepository.create({
      name: userData.name,
      cnic: userData.cnic,
      password: hashedPassword,
      role: userData.role,
      photoUrl: userData.photoUrl,
      city,
      constituency,
    });

    return this.usersRepository.save(user);
  }

  async findOneByCnic(cnic: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { cnic } });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id }, relations: ['city', 'constituency'] });
  }

  async findAll(): Promise<Pick<User, 'id' | 'name' | 'cnic' | 'role' | 'createdAt'>[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'cnic', 'role', 'photoUrl', 'createdAt'],
      relations: ['city', 'constituency'],
    }) as any;
  }
}
