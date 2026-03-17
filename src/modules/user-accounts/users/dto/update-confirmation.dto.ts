export class UpdateConfirmationCodeDto {
  userId: number;
  newCode: string;
  createdAt: Date;
  expiresAt: Date;
}
