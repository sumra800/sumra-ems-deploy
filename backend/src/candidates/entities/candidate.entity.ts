import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Party } from '../../parties/entities/party.entity';
import { Constituency } from '../../constituencies/entities/constituency.entity';
import { Vote } from '../../votes/entities/vote.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.candidate)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Party, party => party.candidates, { nullable: true })
  party: Party;

  @ManyToOne(() => Constituency, constituency => constituency.candidates)
  constituency: Constituency;

  @Column({ nullable: true })
  photoUrl: string;

  @OneToMany(() => Vote, vote => vote.candidate)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
