// dto/create-user.dto.ts
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import {
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
  email: string;
}
