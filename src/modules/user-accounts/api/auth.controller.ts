import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Ip,
  Headers,

} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto, EmailDto, NewPasswordDto } from '../api/input-dto/users.input-dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MeViewDto } from './view-dto/users.view-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { AuthService } from '../application/services/auth.service';
import { Nullable, UserContextDto } from '../guards/dto/user-contex.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extracr-user-from-request.decorator';
import { ExtractUserIfExistsFromRequest } from '../guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { JwtOptionalAuthGuard } from '../guards/bearer/jwt-optional-auth.guard';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infastructure/query/auth.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../application/auth-usecases/login-usecase';
import { ResendConfirmationEmailCommand } from '../application/auth-usecases/resend-confirmation-email-usecase';
import { SendPasswordRecoveryEmailCommand } from '../application/auth-usecases/send-password-recovery-email-usecase';
import { SetNewPasswordCommand } from '../application/auth-usecases/set-new-password-usecase';
import { RegisterUserCommand } from '../application/users-usecases/register-user-usecase';
import { ConfirmEmailCommand } from '../application/auth-usecases/confirm-email-usecase';
import { Response } from 'express';
import { CreateSessionCommand } from '../security-devices/application/usecases/create-session.usecase';
import { v4 as uuidv4 } from 'uuid'
import { RefreshTokenGuard } from '../guards/bearer/refresh-token.guard';
import { ExtractUserWithDeviceId } from '../guards/decorators/extract-deviceId-from-refreshToken.decorator';
import { UserWithDeviceIdContextDto } from '../guards/dto/deviceId-context.dto';
import { RefreshTokensCommand } from '../application/auth-usecases/refresh-tokens.usecase'
import { LogOutCommand } from '../application/auth-usecases/logout.usecase';
import { ThrottlerGuard } from '@nestjs/throttler';


@Controller('auth')
export class AuthController {
  constructor(

    private authQueryRepository: AuthQueryRepository,
    private commandBus: CommandBus
  ) { }
  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto): Promise<void> {
    return await this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('login')
   @UseGuards(ThrottlerGuard,LocalAuthGuard)
   @HttpCode(HttpStatus.OK)
 
  //swagger doc
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  async login(
    /*@Request() req: any*/
    @ExtractUserFromRequest() user: UserContextDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ accessToken: string }> {
    console.log(user.id)
    const title = this.getDeviceTitle(userAgent)
    const deviceId = uuidv4()






    const result = await this.commandBus.execute(
      new LoginCommand(user.id, deviceId)
    )

    const dto = {
      userId: user.id,
      ip,
      title,
      deviceId: deviceId,
      refreshToken: result.refreshToken
    }

    const creatSession = await this.commandBus.execute(new CreateSessionCommand(dto))

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true

    });

    return { accessToken: result.accessToken }; // Возвращаем accessToken в теле
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  passwordRecovery(@Body() body: EmailDto): Promise<void> {
    return this.commandBus.execute
      (new SendPasswordRecoveryEmailCommand(body.email))
  }

  @Post('new-password')
   @UseGuards(ThrottlerGuard)
  newPassword(@Body() body: NewPasswordDto): Promise<void> {
    return this.commandBus.execute(new SetNewPasswordCommand(body.newPassword, body.recoveryCode))
  }

  @Post('registration-confirmation')
   @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(@Body() body: { code: string }): Promise<void> {
    return this.commandBus.execute(new ConfirmEmailCommand(body.code))
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailDto): Promise<void> {
    return await this.commandBus.execute(new ResendConfirmationEmailCommand(body.email))
  }


  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }

  @ApiBearerAuth()
  @Get('me-or-default')
  @UseGuards(JwtOptionalAuthGuard)
  async meOrDefault(
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<Nullable<MeViewDto>> {
    if (user) {
      return this.authQueryRepository.me(user.id!);
    } else {
      return {
        login: 'anonymous',
        userId: null,
        email: null,

      };
    }
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @ExtractUserWithDeviceId() user: UserWithDeviceIdContextDto,
    @Res({ passthrough: true }) response: Response)
    : Promise<{ accessToken: string }> {
    const refreshToken = user.refreshToken
    const userId = user.userId
    const deviceId = user.deviceId
    const result = await this.commandBus.execute(new RefreshTokensCommand(userId, deviceId, refreshToken));
   
    response.cookie('refreshToken', result.newRefreshToken, {
      httpOnly: true,
      secure: true

    });

    return { accessToken: result.newAccessToken };
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @ExtractUserWithDeviceId() user: UserWithDeviceIdContextDto,
    @Res({ passthrough: true }) response: Response)
    : Promise<void> {
    const refreshToken = user.refreshToken
    const userId = user.userId
    const deviceId = user.deviceId
    const result = await this.commandBus.execute(new LogOutCommand(userId, deviceId, refreshToken));
    console.log(refreshToken + "отобразился")

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true
    })
  }



  private getDeviceTitle(userAgent: string): string {
    return userAgent?.includes('Mobile')
      ? 'Mobile Device'
      : userAgent?.includes('Tablet')
        ? 'Tablet Device'
        : userAgent?.includes('Desktop')
          ? 'Desktop Device'
          : 'Unknown device';
  }
}