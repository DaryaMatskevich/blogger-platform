import { User } from '../../domain/dto/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(user: User): UserViewDto {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    } as UserViewDto;
  }
}

export class MeViewDto {
  email: string;
  login: string;
  userId: string;

  static mapToView(user: User): MeViewDto {
    return {
      email: user.email,
      login: user.login,
      userId: user.id.toString(),
    } as MeViewDto;
  }
}
