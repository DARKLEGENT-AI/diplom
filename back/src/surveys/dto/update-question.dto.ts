import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator'
import { QuestionType } from '../question.entity'

export class UpdateQuestionDto {
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType

  @IsOptional()
  @IsString()
  text?: string

  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number
}
