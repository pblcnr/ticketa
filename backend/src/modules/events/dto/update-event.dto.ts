import { IsDateString, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  place?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceInCents?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
