import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { AuthenticatedUser } from '../../../shared/types/authenticated-user';
import { SigninDto } from '../dto/signin.dto';
import { SignupDto } from '../dto/signup.dto';
import { AuthService, LoginResult, SignupResult } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<SignupResult> {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: SigninDto): Promise<LoginResult> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  me(@Req() req: Request & { user: AuthenticatedUser }): AuthenticatedUser {
    return req.user;
  }
}
