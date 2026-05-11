import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'
import { Response } from '../sessions/response.entity'
import { Session } from '../sessions/session.entity'
import { SurveysModule } from '../surveys/surveys.module'

@Module({
  imports: [TypeOrmModule.forFeature([Response, Session]), SurveysModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
