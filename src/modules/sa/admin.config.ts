import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../core/config-validation.utility';

@Injectable()
export class AdminConfig {
  @IsNotEmpty({
    message: 'Set ADMIN_USERNAME, dangerous for security!',
  })
  adminUserName: string;

  @IsNotEmpty({
    message: 'Set ADMIN_PASSWORD, dangerous for security!',
  })
  adminPassword: string;

  constructor(private configService: ConfigService<any, true>) {
    this.adminUserName = this.configService.get('ADMIN_USERNAME');

    this.adminPassword = this.configService.get('ADMIN_PASSWORD');

    configValidationUtility.validateConfig(this);
  }
}
