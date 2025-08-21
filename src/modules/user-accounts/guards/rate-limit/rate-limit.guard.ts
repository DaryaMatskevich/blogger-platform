import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiRequestCount } from '../../apiRequestCount/apiRequestCount.schema';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @InjectModel(ApiRequestCount.name) 
    private readonly apiRequestModel: Model<ApiRequestCount>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const IP = request.ip;
    const URL = request.originalUrl;
    const currentTime = new Date();
    const timeLimit = new Date(Date.now() - 10000); // 10 seconds ago

    try {
      // First, remove old entries
      await this.apiRequestModel.deleteMany({
        IP,
        URL,
        date: { $lt: timeLimit }
      }).exec();

      // Then add current request
      await this.apiRequestModel.create({
        IP,
        URL,
        date: currentTime
      });

      // Count requests in the time window
      const requestCount = await this.apiRequestModel.countDocuments({
        IP,
        URL,
        date: { $gte: timeLimit }
      }).exec();

      // Add rate limit headers to response
      response.setHeader('X-RateLimit-Limit', '5');
      response.setHeader('X-RateLimit-Remaining', Math.max(0, 5 - requestCount));
      response.setHeader('X-RateLimit-Reset', new Date(Date.now() + 10000).toISOString());

      if (requestCount > 5) {
        response.status(429).send('Too Many Requests');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limiting error:', error);
      // In case of error, allow the request to proceed
      return true;
    }
  }
}