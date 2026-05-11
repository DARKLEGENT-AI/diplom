import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { MedicalController } from './medical.controller'
import { MedicalService } from './medical.service'
import { AppointmentSlot } from './appointment-slot.entity'
import { Patient } from './patient.entity'
import { Region } from './region.entity'
import { MedicalServiceEntity } from './service.entity'
import { StatisticsMonth } from './statistics-month.entity'
import { StatisticsWeek } from './statistics-week.entity'
import { Visit } from './visit.entity'

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Patient, Region, MedicalServiceEntity, Visit, StatisticsWeek, StatisticsMonth, AppointmentSlot])],
  controllers: [MedicalController],
  providers: [MedicalService],
  exports: [MedicalService],
})
export class MedicalModule {}
