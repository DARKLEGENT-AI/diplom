import { IsDateString, IsOptional, IsString } from 'class-validator'

export class CreateAppointmentSlotDto {
  @IsString()
  doctorId!: string

  @IsOptional()
  @IsString()
  serviceId?: string

  @IsDateString()
  startsAt!: string

  @IsDateString()
  endsAt!: string
}
