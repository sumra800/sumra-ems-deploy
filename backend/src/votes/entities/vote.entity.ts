import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { Election } from '../../elections/entities/election.entity';

@Entity('votes')
@Unique(['voter', 'election']) // A voter can only vote once per election
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.votes)
  voter: User;

  @ManyToOne(() => Candidate, candidate => candidate.votes)
  candidate: Candidate;

  @ManyToOne(() => Election, election => election.votes)
  election: Election;

  @CreateDateColumn()
  timestamp: Date;
}
