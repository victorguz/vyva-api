import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard';

import { AuthService } from './auth.service';
import { GoogleSignInDto, LoginWithApiKeyDto, RefreshTokenRequest } from './dtos/auth.dto';

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
  async refreshToken(@Body() body: RefreshTokenRequest) {
    return this.authService.refreshToken(body);
  }

  @Post('loginWithApiKey')
  @ApiOperation({ summary: 'Login with API key' })
  async loginWithApiKey(@Body() body: LoginWithApiKeyDto) {
    return this.authService.loginWithApiKey(body.apiKey);
  }

}
