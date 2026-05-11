import { IsObject, IsOptional, IsString } from 'class-validator'

export class SubmitAnswerDto {
  @IsString()
  questionId!: string

  @IsOptional()
  @IsString()
  participantId?: string

  @IsObject()
  answer!: Record<string, unknown>
}
