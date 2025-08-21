import { Controller, UseGuards, Get, Delete, HttpCode, HttpStatus, Param, Req } from '@nestjs/common';
import { SessionViewDto } from './view-dto/sessions.view-dto';
import { SessionsQueryRepository } from '../infrastructure/query/sessions.query-repository';
import { JwtAuthGuard } from '../../guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../guards/decorators/param/extracr-user-from-request.decorator';
import { UserContextDto } from '../../guards/dto/user-contex.dto';
import { ApiParam } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from '../application/usecases/delete-session.use-case';
import { RefreshTokenGuard } from '../../guards/bearer/refresh-token.guard';
import { ExtractUserWithDeviceId } from '../../guards/decorators/extract-deviceId-from-refreshToken.decorator';
import { UserWithDeviceIdContextDto } from '../../guards/dto/deviceId-context.dto';

@Controller('security/devices')
export class SessionsController {
  constructor(
    private sessionsQueryRepository: SessionsQueryRepository,
    private commandBus: CommandBus,
  ) { }

  @Get()
  @UseGuards(RefreshTokenGuard)
  async getAll(
 @ExtractUserWithDeviceId() user : UserWithDeviceIdContextDto)
  : Promise<SessionViewDto[]> {
    return this.sessionsQueryRepository.findAllActiveSessionsByUserId(user.userId);
  }



  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)

  async deleteSessionById(@Param('id',) deviceId: string,
    @ExtractUserWithDeviceId() user : UserWithDeviceIdContextDto): Promise<void> {
    return this.commandBus.execute(new DeleteSessionCommand(deviceId, user.userId));
  }

  
  @Delete()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)

  async deleteAllSessionsExcludeCurrent(
  @ExtractUserWithDeviceId() user : UserWithDeviceIdContextDto): Promise<void> {
     const userId = user.userId
     const deviceId = user.deviceId
    return this.commandBus.execute(new DeleteSessionCommand(userId, deviceId));
  }
}
