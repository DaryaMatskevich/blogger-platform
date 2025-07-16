
import { DomainExceptionCode } from '../domain-exeption-codes';
import { Extension } from '../domain-exeptions';


export type ErrorResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  extensions: Extension[];
  code: DomainExceptionCode;
};