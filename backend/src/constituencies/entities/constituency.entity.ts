import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity('constituencies')
export class Constituency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  region: string;

  @OneToMany(() => User, user => user.constituency)
  users: User[];

  @OneToMany(() => Candidate, candidate => candidate.constituency)
  candidates: Candidate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
