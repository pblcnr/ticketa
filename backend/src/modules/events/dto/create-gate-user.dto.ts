import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGateUserDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}
