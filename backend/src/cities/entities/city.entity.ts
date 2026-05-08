import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Constituency } from '../../constituencies/entities/constituency.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: 'Unspecified' })
  province: string;

  @OneToMany(() => Constituency, constituency => constituency.city)
  constituencies: Constituency[];

  @OneToMany(() => User, user => user.city)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
