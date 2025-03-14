import { Module } from '@nestjs/common';
import { InstructionsController } from './instructions.controller';
import { InstructionsService } from './instructions.service';
import { SupabaseService } from '../webrtc/supabase.service';
import { JournalService } from '../webrtc/journal.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [InstructionsController],
  providers: [
    InstructionsService,
    SupabaseService,
    JournalService,
    ConfigService,
  ],
  exports: [InstructionsService],
})
export class InstructionsModule {}
