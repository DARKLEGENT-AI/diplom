import { IsOptional, IsString, IsObject } from 'class-validator'

export class CreateSurveyDto {
  @IsString()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>
}
