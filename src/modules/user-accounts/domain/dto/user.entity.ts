import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Name, NameSchema } from './name.schema';
import { CreateUserDomainDto } from './create-user.domain.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';


export const loginConstraints = {
  minLength: 3,
  maxLength: 10
}

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20
}

export const emailConstraints = {
  match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
}


@Schema({ timestamps: true })

export class User {

  @Prop({ type: String, required: true, ...loginConstraints })
  login: string;


  @Prop({ type: String, required: true })
  passwordHash: string;


  @Prop({ type: String, min: 5, required: true, ...emailConstraints })
  email: string;

  @Prop({ type: Boolean, required: true, default: false })
  isEmailConfirmed: boolean;

  @Prop({ type: String, nullable: true })
  confirmationCode: string | null;

  @Prop({ type: Date, nullable: true })
  confirmationCodeCreatedAt: Date | null;

  // @Prop(NameSchema) this variant from docdoesn't make validation for inner object
  // @Prop({ type: NameSchema })
  // name: Name;


  createdAt: Date;
  updatedAt: Date;


  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;


  get id() {
    // @ts-ignore
    return this._id.toString();
  }


  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.login = dto.login;
    user.passwordHash = dto.passwordHash;
    user.email = dto.email;
    user.isEmailConfirmed = false; // пользователь ВСЕГДА должен после регистрации подтверждить свой Email

    // user.name = {
    //   firstName: 'firstName xxx',
    //   lastName: 'lastName yyy',
    // };

    return user as UserDocument;
  }


  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  setConfirmationCode(code: string): void {
    if (!code || typeof code !== 'string') {
      throw new Error('Confirmation code must be a non-empty string');
    }

    this.confirmationCode = code;
    this.confirmationCodeCreatedAt = new Date(); // Добавляем timestamp создания кода
    this.isEmailConfirmed = false; // Сбрасываем статус подтверждения
  }


  update(dto: UpdateUserDto) {
    if (dto.email !== this.email) {
      this.isEmailConfirmed = false;
      this.email = dto.email;
    }
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;