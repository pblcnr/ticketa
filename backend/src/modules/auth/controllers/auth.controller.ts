import { Body, Controller, Post } from '@nestjs/common';
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
}
