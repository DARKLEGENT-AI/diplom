import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SurveysController } from './surveys.controller'
import { SurveysService } from './surveys.service'
import { Survey } from './survey.entity'
import { Question } from './question.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Question])],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
