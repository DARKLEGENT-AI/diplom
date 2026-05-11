import { IsOptional, IsString } from 'class-validator'

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  specialty?: string

  @IsOptional()
  @IsString()
  doctorDescription?: string

  @IsOptional()
  @IsString()
  office?: string
}
