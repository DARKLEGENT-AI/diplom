import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator'

export class UpdateAppointmentSlotDto {
  @IsOptional()
  @IsString()
  serviceId?: string

  @IsOptional()
  @IsDateString()
  startsAt?: string

  @IsOptional()
  @IsDateString()
  endsAt?: string

  @IsOptional()
  @IsIn(['available', 'booked', 'cancelled'])
  status?: 'available' | 'booked' | 'cancelled'
}
