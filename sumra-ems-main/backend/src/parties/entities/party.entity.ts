import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity('parties')
export class Party {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  leaderName: string;

  @OneToMany(() => Candidate, candidate => candidate.party)
  candidates: Candidate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
