import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/enums/role.enum'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CreateAppointmentSlotDto } from './dto/create-appointment-slot.dto'
import { CreatePatientDto } from './dto/create-patient.dto'
import { CreateRegionDto } from './dto/create-region.dto'
import { CreateServiceDto } from './dto/create-service.dto'
import { CreateVisitDto } from './dto/create-visit.dto'
import { UpdateAppointmentSlotDto } from './dto/update-appointment-slot.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { MedicalService } from './medical.service'

@Controller('medical')
export class MedicalController {
  constructor(private readonly medicalService: MedicalService) {}

  @Get('status')
  getStatus() {
    return this.medicalService.getStatus()
  }

  @Get('dashboard')
  getDashboard() {
    return this.medicalService.getDashboard()
  }

  @Get('patients')
  listPatients() {
    return this.medicalService.listPatients()
  }

  @Get('doctors')
  listDoctors() {
    return this.medicalService.listDoctors()
  }

  @Get('appointment-slots/free')
  listFreeAppointmentSlots() {
    return this.medicalService.listFreeAppointmentSlots()
  }

  @UseGuards(JwtAuthGuard)
  @Get('appointment-slots/my')
  listMyAppointmentSlots(@CurrentUser() user: { id: string }) {
    return this.medicalService.listMyAppointmentSlots(user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Doctor)
  @Get('appointment-slots/doctor/my')
  listDoctorAppointmentSlots(@CurrentUser() user: { id: string }) {
    return this.medicalService.listDoctorAppointmentSlots(user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Doctor)
  @Post('appointment-slots')
  createAppointmentSlot(@Body() dto: CreateAppointmentSlotDto, @CurrentUser() user: { id: string; role: UserRole }) {
    if (user.role === UserRole.Doctor) {
      dto.doctorId = user.id
    }
    return this.medicalService.createAppointmentSlot(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('appointment-slots/:id/book')
  bookAppointmentSlot(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.medicalService.bookAppointmentSlot(id, user.id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Doctor)
  @Patch('appointment-slots/:id')
  updateAppointmentSlot(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentSlotDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.medicalService.updateAppointmentSlot(id, dto, user)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Doctor)
  @Delete('appointment-slots/:id')
  deleteAppointmentSlot(@Param('id') id: string, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.medicalService.deleteAppointmentSlot(id, user)
  }

  @Post('patients')
  createPatient(@Body() dto: CreatePatientDto) {
    return this.medicalService.createPatient(dto)
  }

  @Get('patients/:id')
  getPatient(@Param('id') id: string) {
    return this.medicalService.getPatient(id)
  }

  @Patch('patients/:id')
  updatePatient(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.medicalService.updatePatient(id, dto)
  }

  @Delete('patients/:id')
  deletePatient(@Param('id') id: string) {
    return this.medicalService.deletePatient(id)
  }

  @Get('visits')
  listVisits() {
    return this.medicalService.listVisits()
  }

  @Post('visits')
  createVisit(@Body() dto: CreateVisitDto) {
    return this.medicalService.createVisit(dto)
  }

  @Get('services')
  listServices() {
    return this.medicalService.listServices()
  }

  @Post('services')
  createService(@Body() dto: CreateServiceDto) {
    return this.medicalService.createService(dto)
  }

  @Get('regions')
  listRegions() {
    return this.medicalService.listRegions()
  }

  @Post('regions')
  createRegion(@Body() dto: CreateRegionDto) {
    return this.medicalService.createRegion(dto)
  }

  @Get('statistics/week')
  getWeeklyStatistics() {
    return this.medicalService.getWeeklyStatistics()
  }

  @Get('statistics/month')
  getMonthlyStatistics() {
    return this.medicalService.getMonthlyStatistics()
  }
}
