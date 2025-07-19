import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: "smtp.mail.ru",
        port: 465,
        secure: true,
      auth: {
        user: "backendlessons@mail.ru",
        pass: "P7RQbjw9DkmdvNzF0jH1"
,
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
export class NotificationsModule { }