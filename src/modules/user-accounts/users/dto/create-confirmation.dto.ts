export class CreateConfirmationDto {
  isEmailConfirmed: boolean;
  code: string | null;
  codeExpiresAt: Date | null;
}
