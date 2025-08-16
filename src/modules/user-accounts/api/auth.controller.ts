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


@Controller('auth')
export class AuthController {
  constructor(

    private authQueryRepository: AuthQueryRepository,
    private commandBus: CommandBus
  ) { }
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
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

    const dto = {
      userId: user.id,
      ip,
      title,
      deviceId: deviceId
    }

    const creatSession = await this.commandBus.execute(new CreateSessionCommand(dto))


    const result = await this.commandBus.execute(
      new LoginCommand(user.id, deviceId )
    )


    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true

    });

    return { accessToken: result.accessToken }; // Возвращаем accessToken в теле
  }

  @Post('password-recovery')
  passwordRecovery(@Body() body: EmailDto): Promise<void> {
    return this.commandBus.execute
      (new SendPasswordRecoveryEmailCommand(body.email))
  }

  @Post('new-password')
  newPassword(@Body() body: NewPasswordDto): Promise<void> {
    return this.commandBus.execute(new SetNewPasswordCommand(body.newPassword, body.recoveryCode))
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(@Body() body: { code: string }): Promise<void> {
    return this.commandBus.execute(new ConfirmEmailCommand(body.code))
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(@Body() body: EmailDto): Promise<void> {
    return this.commandBus.execute(new ResendConfirmationEmailCommand(body.email))
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