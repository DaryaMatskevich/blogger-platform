import { User } from '../../domain/dto/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  // firstName: string;
  // lastName: string | null;

  static mapToView(user: User): UserViewDto {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    } as UserViewDto;
  }
}

export class MeViewDto {
  userId: string;
  login: string;
  email: string;

  static mapToView(user: User): MeViewDto {
    return {
      userId: user.id.toString(),
      login: user.login,
      email: user.email,
    } as MeViewDto;
  }
}
