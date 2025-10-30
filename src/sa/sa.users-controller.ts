import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from '../modules/user-accounts/dto/create-user.dto';
import { UsersService } from '../modules/user-accounts/application/services/users.service';
import { GetUsersQueryParams } from '../modules/user-accounts/api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../core/dto/base.paginated.view.dto';
import { UserViewDto } from '../modules/user-accounts/api/view-dto/users.view-dto';
import { UsersQueryRepository } from '../modules/user-accounts/infastructure/query/users.query-repository';
import { ObjectIdValidationPipe } from '../core/pipes/object-id-validation-pipe.service';
import { DeleteUserCommand } from '../modules/user-accounts/application/users-usecases/delete-user-usecase';
import { CommandBus } from '@nestjs/cqrs';
import { SaGuard } from '../sa/sa.guard';

@UseGuards(SaGuard)
@Controller('sa/users')
export class SaUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);

    // Форматируем ответ согласно требованиям тестов
    return user;
  }

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
