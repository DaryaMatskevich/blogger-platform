import { Trim } from "../../../../core/decorators/transform/trim";
import { IsString } from "class-validator";

/**
 * user object for the jwt token and for transfer from the request object
 */
export class UserWithDeviceIdContextDto {

  @IsString()
  @Trim()
  userId: string;

  @IsString()
  @Trim()
  deviceId: string;
}

export type Nullable<T> = { [P in keyof T]: T[P] | null };