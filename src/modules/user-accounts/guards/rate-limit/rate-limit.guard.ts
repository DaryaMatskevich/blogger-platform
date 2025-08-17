import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiRequestCount, ApiRequestCountModelType } from '../../apiRequestCount/apiRequestCount.schema';
 // Путь к вашей схеме

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @InjectModel(ApiRequestCount.name) 
    private readonly apiRequestModel: ApiRequestCountModelType,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const IP = request.ip;
    const URL = request.originalUrl;
    const currentTime = new Date();
    const timeLimit = new Date(Date.now() - 10000);

    try {
      // Удаляем старые записи и добавляем текущий запрос
      await this.apiRequestModel.bulkWrite([
        {
          deleteMany: {
            filter: {
              IP,
              URL,
              date: { $lt: timeLimit }
            }
          }
        },
        { insertOne: { document: { IP, URL, date: currentTime } } }
      ]);

      // Считаем количество запросов за период
      const requestCount = await this.apiRequestModel.countDocuments({
        IP,
        URL,
        date: { $gte: timeLimit },
      });

      if (requestCount > 5) {
        response.status(429).send('Too Many Requests');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limiting error:', error);
      response.status(500).send('Internal Server Error');
      return false;
    }
  }
}