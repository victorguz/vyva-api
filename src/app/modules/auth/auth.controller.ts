import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthCreateUserDto,
  AuthRequestDto,
  AuthUser,
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

  @Post('public/signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  async signup(@Body() body: AuthCreateUserDto) {
    return this.authService.createUser(body);
  }

  @Post('public/signup2')
  @ApiOperation({ summary: 'Sign up a new user' })
  async signup2(@Body() body: AuthCreateUserDto) {
    return this.authService.createUser(body);
  }

  @Post('public/login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: AuthRequestDto) {
    return this.authService.login(body);
  }

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
    @CurrentUser() user: AuthUser,
  ) {
    return this.authService.refreshToken(body);
  }
}
