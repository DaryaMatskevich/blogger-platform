import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../user-accounts/infastructure/query/users.query-repository';
import { UsersRepository } from '../../../user-accounts/infastructure/users.repository';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { ConfirmationRepository } from '@src/modules/user-accounts/infastructure/confirmation.repository';

export class DeleteUserCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersRepository: UsersRepository,
    private confirmationRepository: ConfirmationRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.usersQueryRepository.getByIdRaw(command.id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `User not found`,
      });
    }
    try {
      await this.confirmationRepository.deleteConfirmation(command.id);
      await this.usersRepository.deleteUser(command.id);
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `Failed to create user: ${error.message}`,
      });
    }
  }
}
