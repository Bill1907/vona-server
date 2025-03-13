import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebRTCModule } from './webrtc/webrtc.module';
import { JournalsModule } from './journals/journals.module';
import { InstructionsModule } from './instructions/instructions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WebRTCModule,
    JournalsModule,
    InstructionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
