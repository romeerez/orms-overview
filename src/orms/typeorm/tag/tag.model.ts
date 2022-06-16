import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Tag as TagType } from 'app/tag/tag.types';

@Entity()
export class Tag implements TagType {
  @PrimaryGeneratedColumn() id!: number;
  @Column() tag!: string;
}
