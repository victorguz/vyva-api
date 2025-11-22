import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';

@Module({
  imports: [SharedModule],
  controllers: [DomainsController],
  providers: [DomainsService],
})
export class DomainsModule {}

