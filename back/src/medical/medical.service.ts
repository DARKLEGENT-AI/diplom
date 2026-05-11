import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, IsNull, MoreThanOrEqual, Repository } from 'typeorm'
import { UserRole } from '../common/enums/role.enum'
import { UsersService } from '../users/users.service'
import { AppointmentSlot } from './appointment-slot.entity'
import { CreateAppointmentSlotDto } from './dto/create-appointment-slot.dto'
import { CreatePatientDto } from './dto/create-patient.dto'
import { CreateRegionDto } from './dto/create-region.dto'
import { CreateServiceDto } from './dto/create-service.dto'
import { CreateVisitDto } from './dto/create-visit.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { UpdateAppointmentSlotDto } from './dto/update-appointment-slot.dto'
import { Patient } from './patient.entity'
import { Region } from './region.entity'
import { MedicalServiceEntity } from './service.entity'
import { Visit } from './visit.entity'

@Injectable()
export class MedicalService {
  constructor(
    @InjectRepository(Patient) private readonly patientsRepo: Repository<Patient>,
    @InjectRepository(Region) private readonly regionsRepo: Repository<Region>,
    @InjectRepository(MedicalServiceEntity) private readonly servicesRepo: Repository<MedicalServiceEntity>,
    @InjectRepository(Visit) private readonly visitsRepo: Repository<Visit>,
    @InjectRepository(AppointmentSlot) private readonly slotsRepo: Repository<AppointmentSlot>,
    private readonly usersService: UsersService,
  ) {}

  getStatus() {
    return { status: 'ok', message: 'Medical accounting module ready' }
  }

  async listRegions() {
    return this.regionsRepo.find({ order: { name: 'ASC' } })
  }

  async createRegion(dto: CreateRegionDto) {
    const existing = await this.regionsRepo.findOne({ where: { name: dto.name.trim() } })
    if (existing) return existing
    return this.regionsRepo.save(this.regionsRepo.create({
      name: dto.name.trim(),
      district: dto.district?.trim() || undefined,
      code: dto.code?.trim() || undefined,
    }))
  }

  async listServices() {
    return this.servicesRepo.find({ order: { name: 'ASC' } })
  }

  async listDoctors() {
    return this.usersService.listDoctors()
  }

  async listFreeAppointmentSlots() {
    const doctors = await this.usersService.listDoctors()
    const [slots, services] = await Promise.all([
      this.slotsRepo.find({
        where: { status: 'available', startsAt: MoreThanOrEqual(new Date()) },
        order: { startsAt: 'ASC' },
      }),
      this.servicesRepo.find(),
    ])

    return slots.map((slot) => this.presentAppointmentSlot(slot, doctors, services))
  }

  async listMyAppointmentSlots(userId: string) {
    const [slots, doctors, services] = await Promise.all([
      this.slotsRepo.find({
        where: { patientUserId: userId },
        order: { startsAt: 'ASC' },
      }),
      this.usersService.listDoctors(),
      this.servicesRepo.find(),
    ])

    return slots.map((slot) => this.presentAppointmentSlot(slot, doctors, services))
  }

  async listDoctorAppointmentSlots(doctorId: string) {
    await this.usersService.ensureDoctorSchedule(doctorId)
    const [slots, doctors, services] = await Promise.all([
      this.slotsRepo.find({
        where: { doctorId, startsAt: MoreThanOrEqual(new Date()) },
        order: { startsAt: 'ASC' },
      }),
      this.usersService.listDoctors(),
      this.servicesRepo.find(),
    ])

    return slots.map((slot) => this.presentAppointmentSlot(slot, doctors, services))
  }

  async createAppointmentSlot(dto: CreateAppointmentSlotDto) {
    const doctor = await this.usersService.findById(dto.doctorId)
    if (doctor.role !== UserRole.Doctor) {
      throw new BadRequestException('Slot can be created only for doctor user')
    }

    if (dto.serviceId) {
      const service = await this.servicesRepo.findOne({ where: { id: dto.serviceId } })
      if (!service) throw new NotFoundException('Service not found')
    }

    const startsAt = new Date(dto.startsAt)
    const endsAt = new Date(dto.endsAt)
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      throw new BadRequestException('Invalid slot time range')
    }

    const slot = await this.slotsRepo.save(this.slotsRepo.create({
      doctorId: dto.doctorId,
      serviceId: dto.serviceId,
      startsAt,
      endsAt,
      status: 'available',
    }))

    const { passwordHash, ...safeDoctor } = doctor
    const services = dto.serviceId ? [await this.servicesRepo.findOne({ where: { id: dto.serviceId } })] : []
    return this.presentAppointmentSlot(slot, [safeDoctor], services.filter(Boolean) as MedicalServiceEntity[])
  }

  async bookAppointmentSlot(id: string, userId: string) {
    const slot = await this.slotsRepo.findOne({ where: { id } })
    if (!slot) throw new NotFoundException('Appointment slot not found')

    const result = await this.slotsRepo.update(
      { id, status: 'available', patientUserId: IsNull() },
      { status: 'booked', patientUserId: userId },
    )
    if (!result.affected) {
      throw new BadRequestException('Appointment slot is not available')
    }

    const updatedSlot = await this.slotsRepo.findOne({ where: { id } })
    if (!updatedSlot) throw new NotFoundException('Appointment slot not found')

    const [doctors, services] = await Promise.all([this.usersService.listDoctors(), this.servicesRepo.find()])
    return this.presentAppointmentSlot(updatedSlot, doctors, services)
  }

  async updateAppointmentSlot(id: string, dto: UpdateAppointmentSlotDto, user: { id: string; role: UserRole }) {
    const slot = await this.slotsRepo.findOne({ where: { id } })
    if (!slot) throw new NotFoundException('Appointment slot not found')
    if (user.role === UserRole.Doctor && slot.doctorId !== user.id) {
      throw new NotFoundException('Appointment slot not found')
    }

    if (dto.serviceId) {
      const service = await this.servicesRepo.findOne({ where: { id: dto.serviceId } })
      if (!service) throw new NotFoundException('Service not found')
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : slot.startsAt
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : slot.endsAt
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      throw new BadRequestException('Invalid slot time range')
    }

    const nextStatus = dto.status || slot.status
    await this.slotsRepo.update(
      { id },
      {
        serviceId: dto.serviceId ?? slot.serviceId,
        startsAt,
        endsAt,
        status: nextStatus,
        patientUserId: nextStatus === 'available' ? null : slot.patientUserId,
      },
    )

    const updatedSlot = await this.slotsRepo.findOne({ where: { id } })
    if (!updatedSlot) throw new NotFoundException('Appointment slot not found')
    const [doctors, services] = await Promise.all([this.usersService.listDoctors(), this.servicesRepo.find()])
    return this.presentAppointmentSlot(updatedSlot, doctors, services)
  }

  async deleteAppointmentSlot(id: string, user: { id: string; role: UserRole }) {
    const slot = await this.slotsRepo.findOne({ where: { id } })
    if (!slot) throw new NotFoundException('Appointment slot not found')
    if (user.role === UserRole.Doctor && slot.doctorId !== user.id) {
      throw new NotFoundException('Appointment slot not found')
    }
    if (slot.status === 'booked') {
      await this.slotsRepo.update({ id }, { status: 'cancelled' })
      return { deleted: false, cancelled: true }
    }
    await this.slotsRepo.delete({ id })
    return { deleted: true, cancelled: false }
  }

  async createService(dto: CreateServiceDto) {
    return this.servicesRepo.save(this.servicesRepo.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || undefined,
      department: dto.department?.trim() || undefined,
    }))
  }

  async listPatients() {
    const [patients, regions, visits] = await Promise.all([
      this.patientsRepo.find({ order: { createdAt: 'DESC' } }),
      this.regionsRepo.find(),
      this.visitsRepo.find({ order: { date: 'DESC' } }),
    ])
    return patients.map((patient) => this.presentPatient(patient, regions, visits))
  }

  async createPatient(dto: CreatePatientDto) {
    const regionId = await this.resolveRegionId(dto.regionId, dto.regionName)
    const patient = await this.patientsRepo.save(this.patientsRepo.create({
      name: dto.name.trim(),
      birthDate: dto.birthDate,
      contacts: dto.contacts.trim(),
      regionId,
    }))
    return this.getPatient(patient.id)
  }

  async getPatient(id: string) {
    const patient = await this.patientsRepo.findOne({ where: { id } })
    if (!patient) throw new NotFoundException('Patient not found')
    const [regions, visits] = await Promise.all([this.regionsRepo.find(), this.visitsRepo.find({ order: { date: 'DESC' } })])
    return this.presentPatient(patient, regions, visits)
  }

  async updatePatient(id: string, dto: UpdatePatientDto) {
    const patient = await this.patientsRepo.findOne({ where: { id } })
    if (!patient) throw new NotFoundException('Patient not found')
    const regionId = await this.resolveRegionId(dto.regionId, dto.regionName)
    await this.patientsRepo.update(
      { id },
      {
        name: dto.name?.trim() || patient.name,
        birthDate: dto.birthDate || patient.birthDate,
        contacts: dto.contacts?.trim() || patient.contacts,
        regionId: regionId ?? patient.regionId,
      },
    )
    return this.getPatient(id)
  }

  async deletePatient(id: string) {
    const patient = await this.patientsRepo.findOne({ where: { id } })
    if (!patient) throw new NotFoundException('Patient not found')
    await this.visitsRepo.delete({ patientId: id })
    await this.patientsRepo.delete({ id })
    return { deleted: true }
  }

  async listVisits() {
    const [visits, patients, services] = await Promise.all([
      this.visitsRepo.find({ order: { date: 'DESC' } }),
      this.patientsRepo.find(),
      this.servicesRepo.find(),
    ])
    return visits.map((visit) => this.presentVisit(visit, patients, services))
  }

  async createVisit(dto: CreateVisitDto) {
    const patient = await this.patientsRepo.findOne({ where: { id: dto.patientId } })
    if (!patient) throw new NotFoundException('Patient not found')
    const service = await this.servicesRepo.findOne({ where: { id: dto.serviceId } })
    if (!service) throw new NotFoundException('Service not found')
    const visit = await this.visitsRepo.save(this.visitsRepo.create({
      patientId: dto.patientId,
      doctorId: dto.doctorId?.trim() || undefined,
      doctorName: dto.doctorName?.trim() || undefined,
      serviceId: dto.serviceId,
      date: new Date(dto.date),
      status: dto.status || 'planned',
    }))
    return this.presentVisit(visit, [patient], [service])
  }

  async getWeeklyStatistics() {
    const from = new Date()
    from.setDate(from.getDate() - 7)
    return this.buildRegionStatistics(from)
  }

  async getMonthlyStatistics() {
    const from = new Date()
    from.setMonth(from.getMonth() - 1)
    return this.buildServiceStatistics(from)
  }

  async getDashboard() {
    const [patients, visits, services, monthlyStatistics] = await Promise.all([
      this.listPatients(),
      this.listVisits(),
      this.listServices(),
      this.getMonthlyStatistics(),
    ])
    return {
      patientsTotal: patients.length,
      visitsTotal: visits.length,
      completedVisits: visits.filter((visit) => visit.status === 'completed').length,
      plannedVisits: visits.filter((visit) => visit.status === 'planned').length,
      patients: patients.slice(0, 5),
      visits: visits.slice(0, 5),
      topService: monthlyStatistics[0] || null,
      servicesTotal: services.length,
    }
  }

  private async resolveRegionId(regionId?: string, regionName?: string) {
    if (regionId) return regionId
    const name = regionName?.trim()
    if (!name) return undefined
    return (await this.createRegion({ name })).id
  }

  private presentPatient(patient: Patient, regions: Region[], visits: Visit[]) {
    const region = regions.find((item) => item.id === patient.regionId) || null
    const patientVisits = visits.filter((visit) => visit.patientId === patient.id)
    return {
      ...patient,
      region,
      lastVisit: patientVisits[0]?.date || null,
      history: patientVisits.map((visit) => ({
        id: visit.id,
        serviceId: visit.serviceId,
        date: visit.date,
        status: visit.status,
      })),
    }
  }

  private presentVisit(visit: Visit, patients: Patient[], services: MedicalServiceEntity[]) {
    const patient = patients.find((item) => item.id === visit.patientId) || null
    const service = services.find((item) => item.id === visit.serviceId) || null
    return {
      ...visit,
      patient,
      service,
    }
  }

  private presentAppointmentSlot(
    slot: AppointmentSlot,
    doctors: Array<{ id: string; email: string; name?: string; role: string; region?: string; city?: string; avatarUrl?: string }>,
    services: MedicalServiceEntity[],
  ) {
    return {
      ...slot,
      doctor: doctors.find((doctor) => doctor.id === slot.doctorId) || null,
      service: slot.serviceId ? services.find((service) => service.id === slot.serviceId) || null : null,
    }
  }

  private async buildServiceStatistics(from: Date) {
    const [visits, services] = await Promise.all([
      this.visitsRepo.find({ where: { date: MoreThanOrEqual(from) } }),
      this.servicesRepo.find(),
    ])
    const counts = new Map<string, number>()
    visits.forEach((visit) => counts.set(visit.serviceId, (counts.get(visit.serviceId) || 0) + 1))
    return [...counts.entries()]
      .map(([serviceId, count]) => {
        const service = services.find((item) => item.id === serviceId)
        return { serviceId, count, service }
      })
      .sort((a, b) => b.count - a.count)
  }

  private async buildRegionStatistics(from: Date) {
    const [visits, patients, regions, services] = await Promise.all([
      this.visitsRepo.find({ where: { date: Between(from, new Date()) } }),
      this.patientsRepo.find(),
      this.regionsRepo.find(),
      this.servicesRepo.find(),
    ])
    const counts = new Map<string, Map<string, number>>()
    visits.forEach((visit) => {
      const patient = patients.find((item) => item.id === visit.patientId)
      if (!patient?.regionId) return
      const regionCounts = counts.get(patient.regionId) || new Map<string, number>()
      regionCounts.set(visit.serviceId, (regionCounts.get(visit.serviceId) || 0) + 1)
      counts.set(patient.regionId, regionCounts)
    })
    return [...counts.entries()].map(([regionId, serviceCounts]) => ({
      regionId,
      region: regions.find((region) => region.id === regionId) || null,
      patientsCount: patients.filter((patient) => patient.regionId === regionId).length,
      services: [...serviceCounts.entries()]
        .map(([serviceId, count]) => ({
          serviceId,
          count,
          service: services.find((service) => service.id === serviceId) || null,
        }))
        .sort((a, b) => b.count - a.count),
    }))
  }
}
