import { EmailService } from '../../src/modules/notifications/email.service';

export class EmailServiceMock extends EmailService {
  //override method
  private lastConfirmationCode: string | null = null;
  private lastRecoveryCode: string | null = null;
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log('Call mock method sendConfirmationEmail / EmailServiceMock');
    this.lastConfirmationCode = code;
    return;
  }
  async sendPasswordRecoveryEmail(email: string, code: string): Promise<void> {
    this.lastRecoveryCode = code;
  }

  getLastConfirmationCode(): string | null {
    return this.lastConfirmationCode;
  }

  getLastRecoveryCode(): string | null {
    return this.lastRecoveryCode;
  }

  // остальные методы-заглушки
}
