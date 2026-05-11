import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator'
import { QuestionType } from '../question.entity'

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  type!: QuestionType

  @IsString()
  text!: string

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
