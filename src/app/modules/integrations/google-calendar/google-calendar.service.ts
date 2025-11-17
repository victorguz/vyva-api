import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Environment, EnvironmentValues } from 'src/app/core/config/environment.config';
import { User } from 'src/app/schemas/user.schema';

import { GenericResponse } from '../../../core/interfaces/generic-response.interface';
import { Integration, IntegrationKey, IntegrationType } from '../../../schemas/integration.schema';
import { handleError } from '../../../shared/error.functions';
import { IntegrationsService } from '../integrations.service';

export interface GoogleCalendarEventData {
  access_token: string;
  refresh_token: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
  colorId?: string; // '1' a '11' para colores predefinidos
  colorRgbFormat?: string; // Formato hexadecimal: "#a4bdfc"
}

export interface CreateCalendarEventDto {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
  location?: string;
  colorId?: string; // '1' a '11' para colores predefinidos
  colorRgbFormat?: string; // Formato hexadecimal: "#a4bdfc"
}

@Injectable()
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly frontendUrl: string;
  private readonly defaultRedirectUri: string;
  private readonly scopes: string[] = [
    'https://www.googleapis.com/auth/calendar.events',
  ];
  private readonly calendarId: string = 'primary';

  constructor(
    private readonly configService: ConfigService,
    private readonly integrationsService: IntegrationsService,
    @InjectModel('Integration')
    private readonly integrationModel: Model<Integration, IntegrationKey>,
  ) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '';

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'Google OAuth credentials are not properly configured. Please check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
      );
    }

    this.frontendUrl = this.configService.get<Environment>('NODE_LOCAL')
      ? EnvironmentValues.domain.dev
      : EnvironmentValues.domain[
          this.configService.get<Environment>('NODE_ENV')
        ];
    console.log(
      EnvironmentValues.domain[this.configService.get<Environment>('NODE_ENV')],
    );

    this.oauth2Client = new OAuth2Client({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.frontendUrl,
    });
  }

  /**
   * Get OAuth2 authorization URL for Google Calendar
   */
  getAuthUrl(user: User): string {
    console.log(this.frontendUrl);
    console.log(process.env.NODE_LOCAL);

    const redirectUri = `${this.frontendUrl}/private/integrations/google-calendar/callback`;

    const state = Buffer.from(
      JSON.stringify({ userId: user.id, businessInfoId: user.businessInfoId }),
    ).toString('base64');

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      state,
      prompt: 'consent', // Force consent to get refresh token
      redirect_uri: redirectUri, // Explicitly pass redirect_uri
    });
  }

  /**
   * Handle OAuth2 callback and save tokens
   */
  async handleCallback(
    code: string,
    state: string,
    user: User,
  ): Promise<GenericResponse<Integration>> {
    try {
      // Verify state matches current user
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
      if (
        decodedState.userId !== user.id ||
        decodedState.businessInfoId !== user.businessInfoId
      ) {
        throw new Error('Invalid state parameter');
      }

      // Use the same redirect_uri that was used in getAuthUrl
      const redirectUri = `${this.frontendUrl}/private/integrations/google-calendar/callback`;

      // Exchange code for tokens with the same redirect_uri
      const { tokens } = await this.oauth2Client.getToken({
        code,
        redirect_uri: redirectUri,
      });

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to obtain tokens from Google');
      }

      // Prepare data to store
      const calendarData: GoogleCalendarEventData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        token_type: tokens.token_type,
      };

      // Save integration
      return await this.integrationsService.create(
        {
          type: IntegrationType.GOOGLE_CALENDAR,
          data: calendarData,
        },
        user,
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Get authenticated OAuth2 client for a user
   */
  private async getAuthenticatedClient(user: User): Promise<OAuth2Client> {
    const integrationResponse = await this.integrationsService.findByType(
      IntegrationType.GOOGLE_CALENDAR,
      user,
    );

    if (!integrationResponse.data) {
      throw new Error(
        'Google Calendar integration not found. Please connect your Google Calendar first.',
      );
    }

    const integration = integrationResponse.data as any;
    const calendarData: GoogleCalendarEventData = integration.data;

    // Set credentials
    this.oauth2Client.setCredentials({
      access_token: calendarData.access_token,
      refresh_token: calendarData.refresh_token,
      expiry_date: calendarData.expiry_date,
      scope: calendarData.scope,
      token_type: calendarData.token_type,
    });

    // Check if token is expired and refresh if needed
    if (calendarData.expiry_date && Date.now() >= calendarData.expiry_date) {
      try {
        const { credentials } = await this.oauth2Client.refreshAccessToken();

        // Update stored tokens
        const updatedData: GoogleCalendarEventData = {
          ...calendarData,
          access_token: credentials.access_token!,
          expiry_date: credentials.expiry_date,
        };

        await this.integrationsService.update(
          integration.id,
          { data: updatedData },
          user,
        );

        this.oauth2Client.setCredentials(credentials);
      } catch (error) {
        throw new Error(
          'Failed to refresh Google Calendar token. Please reconnect your account.',
        );
      }
    }

    return this.oauth2Client;
  }

  /**
   * Create a calendar event
   */
  async createEvent(
    user: User,
    eventData: CreateCalendarEventDto,
  ): Promise<GenericResponse<any>> {
    try {
      const auth = await this.getAuthenticatedClient(user);
      const calendar = google.calendar({ version: 'v3', auth });

      const event: any = {
        summary: eventData.summary,
        start: eventData.start,
        end: eventData.end,
      };

      // Add description if provided (Google Calendar supports HTML in description)
      if (eventData.description) {
        event.description = eventData.description;
      }

      // Add attendees if provided
      if (eventData.attendees && eventData.attendees.length > 0) {
        event.attendees = eventData.attendees;
      }

      // Add location if provided
      if (eventData.location) {
        event.location = eventData.location;
      }

      // Add color if provided
      if (eventData.colorId) {
        event.colorId = eventData.colorId;
      } else if (eventData.colorRgbFormat) {
        event.colorRgbFormat = eventData.colorRgbFormat;
      }

      // Log event data for debugging
      console.log(
        'Google Calendar Event being created:',
        JSON.stringify(event, null, 2),
      );

      const response = await calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: event,
        sendUpdates:
          eventData.attendees && eventData.attendees.length > 0
            ? 'all'
            : 'none',
      });

      // Log response for debugging
      console.log(
        'Google Calendar Event created successfully:',
        JSON.stringify(response.data, null, 2),
      );

      return new GenericResponse(response.data);
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Update a calendar event
   */
  async updateEvent(
    user: User,
    eventId: string,
    eventData: Partial<CreateCalendarEventDto>,
  ): Promise<GenericResponse<any>> {
    try {
      const auth = await this.getAuthenticatedClient(user);
      const calendar = google.calendar({ version: 'v3', auth });

      // Get existing event first
      const existingEvent = await calendar.events.get({
        calendarId: this.calendarId,
        eventId,
      });

      const updatedEvent = {
        ...existingEvent.data,
        ...eventData,
      };

      const response = await calendar.events.update({
        calendarId: this.calendarId,
        eventId,
        requestBody: updatedEvent,
        sendUpdates:
          eventData.attendees && eventData.attendees.length > 0
            ? 'all'
            : 'none',
      });

      return new GenericResponse(response.data);
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(
    user: User,
    eventId: string,
  ): Promise<GenericResponse<boolean>> {
    try {
      const auth = await this.getAuthenticatedClient(user);
      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });

      return new GenericResponse(true);
    } catch (error) {
      throw handleError(error);
    }
  }
}
