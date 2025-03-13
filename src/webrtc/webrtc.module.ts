import { Module } from '@nestjs/common';
import { WebRTCController } from './webrtc.controller';
import { WebRTCService } from './webrtc.service';
import { SupabaseService } from './supabase.service';
import { JournalService } from './journal.service';
import { InstructionsModule } from '../instructions/instructions.module';

@Module({
  imports: [InstructionsModule],
  controllers: [WebRTCController],
  providers: [WebRTCService, SupabaseService, JournalService],
})
export class WebRTCModule {}
