import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from '../dto/signup.dto';
import { AuthService, SignupResult } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<SignupResult> {
    return this.authService.signup(dto);
  }
}
