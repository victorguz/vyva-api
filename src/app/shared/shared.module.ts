import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

@Module({
  imports: [CacheModule.register()],
  controllers: [],
  providers: [],
  exports: [CacheModule],
})
export class SharedModule {}
