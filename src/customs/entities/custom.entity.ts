import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customs')
export class Custom {
  @PrimaryColumn('int', { unique: true })
  code: number;

  @Column()
  model: string;

  @Column()
  price: number;

  @Column()
  name: string;

  @Column('int', { array: true })
  sizes: number[];

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
