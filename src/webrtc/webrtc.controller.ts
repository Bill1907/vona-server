import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WebRTCService } from './webrtc.service';
import { WebRTCSessionDto } from './dto/webrtc-session.dto';

@Controller('webrtc')
export class WebRTCController {
  constructor(private readonly webrtcService: WebRTCService) {}

  @Post('sessions')
  @UsePipes(new ValidationPipe())
  async createWebRTCSession(@Body() webRTCSessionDto: WebRTCSessionDto) {
    try {
      const { userId, model, voice, instructions } = webRTCSessionDto;

      if (!model || !voice) {
        throw new HttpException(
          'Missing model or voice',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.webrtcService.createWebRTCSession(
        userId,
        model,
        voice,
        instructions,
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to create WebRTC session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
