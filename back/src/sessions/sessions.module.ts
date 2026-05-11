import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Session } from './session.entity'
import { Participant } from './participant.entity'
import { Response } from './response.entity'
import { Question } from '../surveys/question.entity'
import { SessionsService } from './sessions.service'
import { SessionsController } from './sessions.controller'
import { SurveysModule } from '../surveys/surveys.module'
import { SessionsGateway } from './sessions.gateway'

@Module({
  imports: [TypeOrmModule.forFeature([Session, Participant, Response, Question]), SurveysModule],
  providers: [SessionsService, SessionsGateway],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
