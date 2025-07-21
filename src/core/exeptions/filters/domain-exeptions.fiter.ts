import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';


import { DomainException } from '../domain-exeptions';
import { DomainExceptionCode } from '../domain-exeption-codes';
import { ErrorResponseBody } from './error-response-body.type';

//https://docs.nestjs.com/exception-filters#exception-filters-1
//Ошибки класса DomainException (instanceof DomainException)
@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.mapToHttpStatus(exception.code);
    const responseBody = this.buildResponseBody(exception);

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  private buildResponseBody(
    exception: DomainException,): 
   { errorsMessages: Array<{ message: string; field: string }> } {
    if (exception.extensions && exception.extensions.length > 0) {
      return {
        errorsMessages: exception.extensions.map((ext) => ({
          message: ext.message,
          field: ext.key,
        })),
      };
    }
return {
      errorsMessages: [
        {
          message: exception.message,
          field: this.getFieldByExceptionCode(exception.code),
        },
      ],
    };
  }

private getFieldByExceptionCode(code: DomainExceptionCode): string {
    switch (code) {
      case DomainExceptionCode.BadRequest:
        return 'email'; // Для BadRequest используем 'email' по умолчанию
      // Добавьте другие коды при необходимости
      default:
        return '';
    }
  }
}


  