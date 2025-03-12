import { Module } from '@nestjs/common';
import { JournalsController } from './journals.controller';
import { JournalsService } from './journals.service';
import { SupabaseService } from '../webrtc/supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [JournalsController],
  providers: [JournalsService, SupabaseService],
  exports: [JournalsService],
})
export class JournalsModule {}
