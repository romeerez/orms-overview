import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.model';

@Entity()
export class UserFollow {
  static tableName = 'userFollow';

  @PrimaryKey() id!: number;
  @Property() followerId!: number;
  @Property() followingId!: number;

  constructor(params: Pick<UserFollow, 'followerId' | 'followingId'>) {
    Object.assign(this, params);
  }

  @ManyToOne()
  following!: User;
}
