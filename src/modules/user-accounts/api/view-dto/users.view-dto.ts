import { OmitType } from "@nestjs/swagger";
import { UserDocument } from "../../domain/dto/user.entity";

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  
  // firstName: string;
  // lastName: string | null;

  static mapToView(user: UserDocument): UserViewDto {
    const dto = new UserViewDto();
    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;


    // dto.firstName = user.name.firstName;
    // dto.lastName = user.name.lastName;

    return dto;
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user: UserDocument): MeViewDto {
       const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user._id.toString();

    return dto;
  }
}