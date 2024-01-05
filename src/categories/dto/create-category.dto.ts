import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidationOptions,
  registerDecorator,
  validateOrReject,
} from 'class-validator';

import { CategoryTypeEnum } from '../enums/subcategory-type.enum';
import {
  Criteria,
  CriteriaExtendorDto,
  CriteriaFieldDto,
  CriteriaOperatorDto,
  Criterias,
  isConditionable,
} from '../../criterias/dtos/criterias.dto';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { ValidationArguments } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

/**
 * Validates criterias recursively
 * @param criterias - criterias to validate
 * @param dtoClasses - dto classes to compare criterias against
 * @returns true if all criterias are valid
 */
async function validateConditions(
  criterias: Criterias,
  dtoClasses: ClassConstructor<Object>[],
): Promise<boolean> {
  let validCount = 0;

  for (const criteria of criterias) {
    let isValid = false;

    for (const Dto of dtoClasses) {
      try {
        await validateOrReject(plainToClass(Dto, criteria));
        if (isConditionable(criteria)) {
          isValid = await validateConditions(criteria.conditions, dtoClasses);
        } else {
          isValid = true;
        }
      } catch (error) {
        isValid = false;
      }
      if (isValid) {
        break;
      }
    }

    if (isValid) {
      validCount++;
    }
  }

  return validCount === criterias.length;
}

/**
 * Custom decorator to validate criterias array recursively
 * @param dtoClasses - dto classes to compare criterias against
 * @throws BadRequestException if any criteria is invalid
 * @returns true if all criterias are valid
 * */
export function ValidateConditions(
  dtoClasses: ClassConstructor<Object>[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'ValidateConditions',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any[], args: ValidationArguments) {
          if (!value || value.length === 0) return false;

          const valid = await validateConditions(value, dtoClasses);
          if (!valid) {
            throw new BadRequestException(`Invalid criterias`);
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `Invalid criterias`;
        },
      },
    });
  };
}

export class CreateCategoryDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsEnum(CategoryTypeEnum)
  type?: CategoryTypeEnum;

  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateConditions([
    CriteriaFieldDto,
    CriteriaOperatorDto,
    CriteriaExtendorDto,
  ])
  criterias: Criterias;
}
