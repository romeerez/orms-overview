import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserFollow as UserFollowType } from 'app/user/user.types';
import { User } from 'orms/typeorm/user/user.model';

@Entity('userFollow')
export class UserFollow implements UserFollowType {
  @PrimaryGeneratedColumn() id!: number;
  @Column() followerId!: number;
  @Column() followingId!: number;

  @ManyToOne(() => User, (user) => user.followers)
  following!: User;
}
