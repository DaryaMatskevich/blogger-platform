import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
          user: 'backendlessons@mail.ru',
          pass: '3DSVkIwozgE0rfNyiyUC',
        },
        tls: {
          rejectUnauthorized: false, // Важно для обхода сертификатов
        },
      },
      defaults: {
        from: '"backend-lessons" <backendlessons@mail.ru>',
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
