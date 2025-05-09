import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthCreateUserDto,
  AuthRequestDto,
  AuthUser,
  RefreshTokenRequest,
} from './dtos/auth.dto';
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('public/signup')
  async signup(@Body() body: AuthCreateUserDto) {
    return this.authService.createUser(body);
  }

  @Post('public/login')
  async login(@Body() body: AuthRequestDto) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard)
  @Post('refreshToken')
  async refreshToken(
    @Body() body: RefreshTokenRequest,
    @CurrentUser() user: AuthUser,
  ) {
    return this.authService.refreshToken(body);
  }
}
