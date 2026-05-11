import { IsOptional, IsString } from 'class-validator'

export class CreateRegionDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  district?: string

  @IsOptional()
  @IsString()
  code?: string
}
