export class CreateUserDomainDto {
  login: string;
  passwordHash: string;
  email: string;
  confirmationCode: string | null;
}
