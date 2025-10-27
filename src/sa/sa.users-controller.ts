import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateUserDto } from '../modules/user-accounts/dto/create-user.dto';
import { UsersService } from '@src/modules/user-accounts/application/services/users.service';

@Controller('sa/users')
export class SaUsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
