import { IsObject, IsOptional, IsString } from 'class-validator'

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  code?: string

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>
}
