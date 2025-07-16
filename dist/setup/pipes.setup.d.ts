import { INestApplication, ValidationError } from '@nestjs/common';
import { Extension } from '../core/exeptions/domain-exeptions';
export declare const errorFormatter: (errors: ValidationError[], errorMessage?: any) => Extension[];
export declare function pipesSetup(app: INestApplication): void;
