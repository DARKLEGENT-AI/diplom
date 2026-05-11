import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator'
import { SurveyStatus } from '../survey.entity'

export class UpdateSurveyDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>
}
