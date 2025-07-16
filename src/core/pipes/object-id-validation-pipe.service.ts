import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { isValidObjectId } from "mongoose";
import { DomainException } from "../exeptions/domain-exeptions";
import { DomainExceptionCode } from "../exeptions/domain-exeption-codes";

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — ObjectId

    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid ObjectId: ${value}`,
      });
    }

    // Если тип не ObjectId, возвращаем значение без изменений
    return value;
  }
}