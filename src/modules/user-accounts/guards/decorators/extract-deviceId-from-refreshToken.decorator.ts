import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserWithDeviceIdContextDto } from '../dto/deviceId-context.dto';

export const ExtractUserWithDeviceId = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserWithDeviceIdContextDto => {
    const request = context.switchToHttp().getRequest();
    return {
      userId: request.user.userId,
      deviceId: request.user.deviceId,
      refreshToken: request.user.refreshToken,
    }; // Берем из запроса, добавленного guard'ом
  },
);
