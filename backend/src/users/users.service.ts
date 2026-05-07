import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserData {
  name: string;
  cnic: string;
  password: string;
  role?: User['role'];
  constituency?: User['constituency'];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: CreateUserData): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { cnic: userData.cnic } });
    if (existingUser) {
      throw new ConflictException('User with this CNIC already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.usersRepository.create({
      name: userData.name,
      cnic: userData.cnic,
      password: hashedPassword,
      role: userData.role,
    });

    return this.usersRepository.save(user);
  }

  async findOneByCnic(cnic: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { cnic } });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Pick<User, 'id' | 'name' | 'cnic' | 'role' | 'createdAt'>[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'cnic', 'role', 'createdAt'],
    }) as any;
  }
}
