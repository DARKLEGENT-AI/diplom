import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator'

export class CreateVisitDto {
  @IsString()
  patientId!: string

  @IsOptional()
  @IsString()
  doctorId?: string

  @IsOptional()
  @IsString()
  doctorName?: string

  @IsString()
  serviceId!: string

  @IsDateString()
  date!: string

  @IsOptional()
  @IsIn(['planned', 'completed', 'cancelled'])
  status?: string
}
