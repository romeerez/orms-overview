import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Tag as TagType } from 'app/tag/tag.types';

@Entity()
export class Tag implements TagType {
  @PrimaryGeneratedColumn() id!: number;
  @Column() tag!: string;
}
