import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiParam } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { SaUsersService } from '../application/sa.users-service';
import { AdminBasicAuthGuard } from '../guards/basic/admin-auth.guard';
import { UserViewDto } from '../../user-accounts/api/view-dto/users.view-dto';
import { UsersQueryRepository } from '../../user-accounts/infastructure/query/users.query-repository';
import { DeleteUserCommand } from '../application/sa-usecases/delete-user-usecase';
import { CreateUserInputDto } from '../../user-accounts/api/input-dto/users.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view.dto';
import { GetUsersQueryParams } from '../../user-accounts/api/input-dto/get-users-query-params.input-dto';

@Controller('sa/users')
@UseGuards(AdminBasicAuthGuard)
export class SaUsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private saUsersService: SaUsersService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.saUsersService.createUserByAdmin(body);
    const user = await this.usersQueryRepository.getById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    } else {
      return user;
    }
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
