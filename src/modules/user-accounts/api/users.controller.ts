import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UserViewDto } from './view-dto/users.view-dto';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersQueryRepository } from '../infastructure/query/users.query-repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view.dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-pipe.service';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../application/users-usecases/update-user-usecase';
import { DeleteUserCommand } from '../application/users-usecases/delete-user-usecase';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
    private commandBus: CommandBus
  ) {
    console.log('UsersController created');
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id') //users/232342-sdfssdf-23234323
  async getById(@Param('id', ObjectIdValidationPipe) id: string): Promise<UserViewDto> {
    // можем и чаще так и делаем возвращать Promise из action. Сам NestJS будет дожидаться, когда
    // промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.usersQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.usersService.createUser(body);
    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: UpdateUserInputDto,
  ): Promise<UserViewDto> {
    const userId = await this.commandBus.execute(new UpdateUserCommand(id, body));

    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ObjectIdValidationPipe) id: string): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}