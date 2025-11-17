import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { GoogleCalendarController } from './google-calendar/google-calendar.controller';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [SharedModule],
  controllers: [IntegrationsController, GoogleCalendarController],
  providers: [IntegrationsService, GoogleCalendarService],
  exports: [IntegrationsService, GoogleCalendarService],
})
export class IntegrationsModule {}

