import { Module } from '@nestjs/common';
import { InstructionsController } from './instructions.controller';
import { InstructionsService } from './instructions.service';
import { SupabaseService } from '../webrtc/supabase.service';
import { JournalService } from '../webrtc/journal.service';

@Module({
  controllers: [InstructionsController],
  providers: [InstructionsService, SupabaseService, JournalService],
  exports: [InstructionsService],
})
export class InstructionsModule {}
