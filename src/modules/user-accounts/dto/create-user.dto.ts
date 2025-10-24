// dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../constants/user.constraints';

export class CreateUserDto {
  @IsString()
  @MinLength(loginConstraints.minLength)
  @MaxLength(loginConstraints.maxLength)
  login: string;

  @IsString()
  @MinLength(passwordConstraints.minLength)
  @MaxLength(passwordConstraints.maxLength)
  password: string;

  @IsEmail()
  @Matches(emailConstraints.match)
  email: string;
}
