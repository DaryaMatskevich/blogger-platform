import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import {
  loginConstraints,
  passwordConstraints,
} from '../../constants/user.constraints';
import { IsEmail, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateUserInputDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  password: string;

  @Trim()
  @IsEmail()
  email: string;
}

export class NewPasswordDto {
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  newPassword: string;

  @IsString()
  recoveryCode: string;
}

export class EmailDto {
  @IsEmail()
  @Trim()
  email: string;
}
