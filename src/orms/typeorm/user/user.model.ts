import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User as UserType } from 'app/user/user.types';
import { UserFollow } from 'orms/typeorm/user/userFollow.model';

@Entity()
export class User implements UserType {
  @PrimaryGeneratedColumn() id!: number;
  @Column() email!: string;
  @Column() username!: string;
  @Column() password!: string;
  @Column() bio!: string;
  @Column() image!: string;

  @OneToMany(() => UserFollow, (userFollow) => userFollow.following)
  followers?: UserFollow[];
}
