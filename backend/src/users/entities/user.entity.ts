import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { Constituency } from '../../constituencies/entities/constituency.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { Vote } from '../../votes/entities/vote.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  VOTER = 'VOTER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  cnic: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VOTER,
  })
  role: UserRole;

  @ManyToOne(() => Constituency, constituency => constituency.users, { nullable: true })
  constituency: Constituency;

  @OneToOne(() => Candidate, candidate => candidate.user)
  candidate: Candidate;

  @OneToMany(() => Vote, vote => vote.voter)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
