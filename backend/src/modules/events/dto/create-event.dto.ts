import { IsDateString, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsString()
  @MinLength(1)
  place!: string;

  @IsInt()
  @Min(1)
  totalCapacity!: number;

  @IsInt()
  @Min(0)
  priceInCents!: number;

  @IsDateString()
  date!: string;

  @IsString()
  @MinLength(1)
  ticketmasterId!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
