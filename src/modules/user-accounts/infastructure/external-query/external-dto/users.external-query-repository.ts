
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import { User, UserModelType } from '../../../domain/dto/user.entity';
import { UserExternalDto } from './users.external-dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';

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
       throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: "User not found"
              })
    }

    return UserExternalDto.mapToView(user);
  }
}