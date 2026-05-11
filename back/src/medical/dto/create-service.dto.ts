import { IsOptional, IsString } from 'class-validator'

export class CreateServiceDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  department?: string
}
