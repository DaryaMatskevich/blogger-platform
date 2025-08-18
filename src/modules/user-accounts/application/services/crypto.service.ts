import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  async createPasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, salt);
  }

  comparePasswords(args: { password: string; hash: string }): Promise<boolean> {
    return bcrypt.compare(args.password, args.hash);
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  async hashToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 10);
  }

  async compareToken(token: string, hashedToken: string): Promise<boolean> {
    return await bcrypt.compare(token, hashedToken);
  }
}