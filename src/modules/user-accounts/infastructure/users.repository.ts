import { InjectModel } from '@nestjs/mongoose';

import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../domain/dto/user.entity';
import { DomainException } from '@src/core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '@src/core/exeptions/domain-exeption-codes';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      
      throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: "User not found"
        })
    }

    return user;
  }

   findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
   return this.UserModel.findOne({
    $or: [
      { login: loginOrEmail },
      { email: loginOrEmail },
    ],
  });
  }

   findByLogin(login: string): Promise<UserDocument | null> {
   return this.UserModel.findOne({
   login
  });
  }

  findByEmail(email: string): Promise<UserDocument | null> {
   return this.UserModel.findOne({
   email
  });
  }

  async loginIsExist(login: string): Promise<boolean> {
    return !!(await this.UserModel.countDocuments({ login: login }));
  }

  findUserByConfirmationCode(code: string): Promise<UserDocument | null> {
   return this.UserModel.findOne({
   confirmationCode: code
  });
}

  findUserByRecoveryCode(code: string): Promise<UserDocument | null> {
   return this.UserModel.findOne({
   recoveryCode: code
  });
  }
}


