import { IsOptional, IsString } from 'class-validator'

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  region?: string
}
