import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CategoryTypeEnum } from '../../categories/enums/subcategory-type.enum';
import { ComparisonOperator, JoinOperator } from '../enums/criteria';

export interface Conditionable {
  conditions: Criteria[];
}

// check if object is type of conditionable
export function isConditionable(object: any): object is Conditionable {
  return 'conditions' in object;
}

export class CriteriaExtendorDto {
  @IsString()
  @MinLength(3)
  category: string;

  @IsOptional()
  @IsEnum(CategoryTypeEnum)
  type?: CategoryTypeEnum;
}

export class CriteriaOperatorDto implements Conditionable {
  @IsString()
  operator: JoinOperator;

  @IsArray()
  @ArrayMinSize(1)
  conditions: Criteria[];
}

export class CriteriaFieldDto {
  @IsString()
  field: string;

  @IsEnum(ComparisonOperator)
  comparison: ComparisonOperator;

  @IsDefined()
  value: string | number | boolean | number[];
}

export type Criteria =
  | CriteriaOperatorDto
  | CriteriaFieldDto
  | CriteriaExtendorDto;

export type Criterias = Criteria[];
