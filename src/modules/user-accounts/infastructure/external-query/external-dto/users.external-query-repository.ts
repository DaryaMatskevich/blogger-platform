
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

import { User, UserModelType } from '../../../../../modules/user-accounts/domain/dto/user.entity';
import { UserExternalDto } from './users.external-dto';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserExternalDto> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserExternalDto.mapToView(user);
  }
}