import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    //can add html templates, implement advertising and other logic for mailing...
    const confirmationLink = `https://some-front.com/confirm-registration?code=${code}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirm your registration', 
      text: `confirm registration via link ${confirmationLink}`,
       html: `<p>Please confirm your registration by clicking <a href="${confirmationLink}">here</a></p>`
    });
  }

 async sendPasswordRecoveryEmail(email: string, recoveryCode: string): Promise<void> {
    const recoveryLink = `https://some-front.com/password-recovery?code=${recoveryCode}`;
await this.mailerService.sendMail({
      to: email,
      subject: 'Password Recovery',
      text: `To reset your password, please visit: ${recoveryLink}`,
      html: `
        <h1>Password Recovery</h1>
        <p>To reset your password, please follow the link below:</p>
        <a href="${recoveryLink}">Reset password</a>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
    });
  }
}