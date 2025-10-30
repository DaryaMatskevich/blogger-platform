import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../constants/user.constraints';
import { IsEmail, IsString, Matches } from 'class-validator';
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
  @Matches(emailConstraints.match)
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
  @IsString()
  @Matches(emailConstraints.match)
  @Trim()
  email: string;
}
