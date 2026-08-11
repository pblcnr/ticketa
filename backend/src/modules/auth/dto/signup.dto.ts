import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum SignupRole {
  ORGANIZADOR = 'ORGANIZADOR',
  CLIENTE = 'CLIENTE',
}

export class SignupDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsEnum(SignupRole)
  role!: SignupRole;

  @IsOptional()
  @IsString()
  name?: string;
}
