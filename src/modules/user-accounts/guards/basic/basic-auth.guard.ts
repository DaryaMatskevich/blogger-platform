import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DomainExceptionCode } from "@src/core/exeptions/domain-exeption-codes";
import { DomainException } from "@src/core/exeptions/domain-exeptions";
import { Request } from "express";

@Injectable()
export class BasicAuthGuard implements CanActivate {
    private readonly validUsername = "admin";
    private readonly validPassword = "qwerty";

    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader || authHeader.startsWith("Basic ")) {
            throw new NotFoundException()
        }


        const base64Credentials = authHeader.split(" ")[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString(
            'utf-8'
        )
        const [username, password] = credentials.split(':');

        if (username === this.validUsername && password === this.validPassword) {
            return true
        } else {
            throw new DomainException({
                code: DomainExceptionCode.Unauthorized,
                message: 'unauthorised'
            })
        }
    }


}