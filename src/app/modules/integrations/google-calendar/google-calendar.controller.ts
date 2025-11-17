import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericResponse } from '../../../core/interfaces/generic-response.interface';
import { Integration } from '../../../schemas/integration.schema';
import { User } from '../../../schemas/user.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { GoogleCalendarService } from './google-calendar.service';

@ApiTags('Google Calendar Integration')
@Controller('integrations/google-calendar')
@UseGuards(AuthGuard)
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('auth-url')
  @ApiOperation({ summary: 'Get Google Calendar OAuth2 authorization URL' })
  @ApiResponse({
    status: 200,
    description: 'Return the authorization URL.',
  })
  async getAuthUrl(@CurrentUser() user: User): Promise<GenericResponse<{ url: string }>> {
    const url = this.googleCalendarService.getAuthUrl(user);
    return new GenericResponse({ url });
  }

  @Post('callback')
  @ApiOperation({ summary: 'Handle Google Calendar OAuth2 callback' })
  @ApiResponse({
    status: 200,
    description: 'Integration has been successfully created.',
    type: GenericResponse<Integration>,
  })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Integration>> {
    return this.googleCalendarService.handleCallback(code, state, user);
  }
}

