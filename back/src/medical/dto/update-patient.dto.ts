import { IsDateString, IsOptional, IsString } from 'class-validator'

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsDateString()
  birthDate?: string

  @IsOptional()
  @IsString()
  contacts?: string

  @IsOptional()
  @IsString()
  regionId?: string

  @IsOptional()
  @IsString()
  regionName?: string
}
