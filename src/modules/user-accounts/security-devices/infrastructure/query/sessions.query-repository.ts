import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Session, SessionModelType } from '../../domain/session.entity';
import { SessionViewDto } from '../../api/view-dto/sessions.view-dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';

@Injectable()
export class SessionsQueryRepository {
    constructor(
        @InjectModel(Session.name)
        private SessionModel: SessionModelType,
    ) { }

    async findAllActiveSessionsByUserId(userId: string): Promise<SessionViewDto[]> {
        const currentDate = new Date()

        const sessions = await this.SessionModel.find({
            userId,
            expirationDate: { $gt: currentDate },
            deletedAt: null, // Только не удаленные сессии
        }).exec();

if(!sessions) {
    throw new DomainException({
            code: DomainExceptionCode.NotFound,
            message: "Session not found"
          })
        
}


        return sessions.map(session => SessionViewDto.mapToView(session));
    }
}