import { Injectable, PipeTransform } from '@nestjs/common';
import { DomainExceptionCode } from '../../core/exeptions/domain-exeption-codes';
import { DomainException } from '../../core/exeptions/domain-exeptions';

// fixed typo

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

@Injectable()
export class UuidValidationPipe implements PipeTransform {
  constructor(private readonly fieldName: string = 'UUID') {}

  transform(value: any): string {
    if (typeof value !== 'string') {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Invalid UUID: expected string, got ${typeof value}`,
      });
    }

    if (!isValidUUID(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid UUID: ${value}`,
      });
    }

    // Optional: normalize to lowercase
    return value.toLowerCase();
  }
}
