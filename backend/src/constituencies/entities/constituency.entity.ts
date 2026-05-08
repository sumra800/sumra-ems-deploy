import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { City } from '../../cities/entities/city.entity';

@Entity('constituencies')
export class Constituency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  region: string;

  @ManyToOne(() => City, city => city.constituencies, { nullable: true })
  city: City;

  @OneToMany(() => User, user => user.constituency)
  users: User[];

  @OneToMany(() => Candidate, candidate => candidate.constituency)
  candidates: Candidate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
