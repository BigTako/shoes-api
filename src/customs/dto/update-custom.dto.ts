import { IsArray, IsOptional, MinLength } from 'class-validator';

export class UpdateCustomDto {
  @IsOptional()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsArray()
  sizes: number[];
}
