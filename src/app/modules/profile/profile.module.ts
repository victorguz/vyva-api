import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SharedAuthModule } from '../shared/shared-auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SharedAuthModule, UsersModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
