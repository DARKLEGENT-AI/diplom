import { IsDateString, IsOptional, IsString } from 'class-validator'

export class CreatePatientDto {
  @IsString()
  name!: string

  @IsDateString()
  birthDate!: string

  @IsString()
  contacts!: string

  @IsOptional()
  @IsString()
  regionId?: string

  @IsOptional()
  @IsString()
  regionName?: string
}
