import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { CreateUserDto } from '../modules/user-accounts/dto/create-user.dto';
import { UsersService } from '../modules/user-accounts/application/services/users.service';
import { GetUsersQueryParams } from '../modules/user-accounts/api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../core/dto/base.paginated.view.dto';
import { UserViewDto } from '../modules/user-accounts/api/view-dto/users.view-dto';
import { UsersQueryRepository } from '../modules/user-accounts/infastructure/query/users.query-repository';

@Controller('sa/users')
export class SaUsersController {
  constructor(
    private readonly usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userId = await this.usersService.createUser(createUserDto);

    // Форматируем ответ согласно требованиям тестов
    return {
      id: userId,
      login: createUserDto.login,
      email: createUserDto.email,
      createdAt: new Date().toISOString(),
    };
  }

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }
}
