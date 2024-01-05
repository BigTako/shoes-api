import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryTypeEnum } from '../enums/subcategory-type.enum';
import { Criterias } from '../../criterias/dtos/criterias.dto';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: CategoryTypeEnum,
    default: CategoryTypeEnum.CATEGORY,
  })
  type?: CategoryTypeEnum;

  @Column({ type: 'json' })
  criterias: Criterias;
}
