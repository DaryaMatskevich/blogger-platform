export class UpdateSessionRefreshTokenDto {
  deviceId: string;
  userId: number;
  refreshToken: string;
  lastActiveDate: Date;
}
