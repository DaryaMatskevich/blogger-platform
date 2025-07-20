import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto, EmailDto, NewPasswordDto } from './input-dto/users.input-dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MeViewDto } from './view-dto/users.view-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { AuthService } from '../application/auth.service';
import { Nullable, UserContextDto } from '../guards/dto/user-contex.dto';
import { ExtractUserFromRequest } from '../guards/param/extracr-user-from-request.decorator';
import { ExtractUserIfExistsFromRequest } from '../guards/param/extract-user-if-exists-from-request.decorator';
import { JwtOptionalAuthGuard } from '../guards/bearer/jwt-optional-auth.guard';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infastructure/query/auth.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}
  @Post('registration')
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
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
  login(
    /*@Request() req: any*/
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user.id);
  }

 @Post('password-recovery')
  passwordRecovery(@Body() body : EmailDto): Promise<void> {
    return this.authService.sendPasswordRecoveryEmail(body.email)
  }

 @Post('new-password')
  newPassword(@Body() body : NewPasswordDto): Promise<void> {
    return this.authService.setNewPassword(body.newPassword, body.recoveryCode)
  }

   @Post('registration-confirmation')
  registrationConfirmation(@Body() body : {code: string}): Promise<any> {
    return this.authService.confirmEmail(body.code)
  }

  @Post('registration-email-resending')
  registrationEmailResending(@Body() body : EmailDto): Promise<void> {
    return this.authService.resendConfirmationEmail(body.email)
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


}