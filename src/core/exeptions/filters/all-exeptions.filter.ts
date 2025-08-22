import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainExceptionCode } from '../domain-exeption-codes';
import { ErrorResponseBody } from './error-response-body.type';
import { ThrottlerException } from '@nestjs/throttler';


//https://docs.nestjs.com/exception-filters#exception-filters-1
//Все ошибки
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    //ctx нужен, чтобы получить request и response (express). Это из документации, делаем по аналогии
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    //Если сработал этот фильтр, то пользователю улетит 500я ошибка
    let message = exception.message || 'Unknown exception occurred.';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = DomainExceptionCode.InternalServerError;

if (exception instanceof ThrottlerException) {
      status = HttpStatus.TOO_MANY_REQUESTS; // 429
      message = exception.message || 'Too many requests';
      code = DomainExceptionCode.TooManyRequests; // Используем новый код
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message || 'Request failed';
      code =
        status === HttpStatus.UNAUTHORIZED
          ? DomainExceptionCode.Unauthorized
          : status === HttpStatus.BAD_REQUEST
          ? DomainExceptionCode.BadRequest
          : code;
    }

    const responseBody = this.buildResponseBody(request.url, message, code);

    response.status(status).json(responseBody);
  }

  private buildResponseBody(
    requestUrl: string,
    message: string,
    code: DomainExceptionCode,
  ): ErrorResponseBody {
    //TODO: Replace with getter from configService. will be in the following lessons
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        timestamp: new Date().toISOString(),
        path: null,
        message: code === DomainExceptionCode.TooManyRequests ? 'Too many requests' : 'Some error occurred',
        extensions: [],
        code
      };
    }

    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message,
      extensions: [],
      code
    };
  }
}