import { IsObject, IsOptional, IsString } from 'class-validator'

export class CreateTemplateDto {
  @IsString()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsObject()
  snapshot!: Record<string, unknown>
}
