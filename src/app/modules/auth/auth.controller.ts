import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthCreateUserDto,
  AuthRequestDto,
  GoogleSignInDto,
  RefreshTokenRequest,
} from './dtos/auth.dto';
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('public/google')
  @ApiOperation({ summary: 'Sign in with Google' })
  async googleSignIn(@Body() body: GoogleSignInDto) {
    return this.authService.googleSignIn(body);
  }

  @UseGuards(AuthGuard)
  @Post('refreshToken')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(
    @Body() body: RefreshTokenRequest,
  ) {
    return this.authService.refreshToken(body);
  }
}
