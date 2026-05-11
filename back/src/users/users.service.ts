import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { AppointmentSlot } from '../medical/appointment-slot.entity'
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto'
import { User } from './user.entity'
import { UserRole } from '../common/enums/role.enum'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(AppointmentSlot) private readonly slotsRepo: Repository<AppointmentSlot>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data)
    const savedUser = await this.usersRepo.save(user)
    if (savedUser.role === UserRole.Doctor) {
      await this.ensureDoctorSchedule(savedUser.id)
    }
    return savedUser
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } })
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async findPublicById(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findById(id)
    const { passwordHash, ...safeUser } = user
    return safeUser
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<Omit<User, 'passwordHash'>> {
    await this.usersRepo.update({ id }, { avatarUrl })
    return this.findPublicById(id)
  }

  async updateLocation(id: string, city?: string, region?: string): Promise<Omit<User, 'passwordHash'>> {
    await this.usersRepo.update(
      { id },
      {
        city: city?.trim() || undefined,
        region: region?.trim() || undefined,
        locationConfirmedAt: new Date(),
      },
    )
    return this.findPublicById(id)
  }

  async updateDoctorProfile(id: string, dto: UpdateDoctorProfileDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findById(id)
    if (user.role !== UserRole.Doctor) {
      throw new NotFoundException('Doctor profile not found')
    }
    await this.usersRepo.update(
      { id },
      {
        name: dto.name?.trim() || user.name,
        specialty: dto.specialty?.trim() || user.specialty,
        doctorDescription: dto.doctorDescription?.trim() || user.doctorDescription,
        office: dto.office?.trim() || user.office,
      },
    )
    await this.ensureDoctorSchedule(id)
    return this.findPublicById(id)
  }

  async updateRole(id: string, role: User['role']): Promise<User> {
    await this.usersRepo.update({ id }, { role })
    return this.findById(id)
  }

  async list(): Promise<User[]> {
    return this.usersRepo.find({ order: { createdAt: 'DESC' } })
  }

  async listDoctors(): Promise<Omit<User, 'passwordHash'>[]> {
    const doctors = await this.usersRepo.find({ where: { role: UserRole.Doctor }, order: { name: 'ASC', email: 'ASC' } })
    await Promise.all(doctors.map((doctor) => this.ensureDoctorSchedule(doctor.id)))
    return doctors.map((doctor) => {
      const { passwordHash, ...safeDoctor } = doctor
      return safeDoctor
    })
  }

  async ensureDoctorSchedule(doctorId: string) {
    const existingSlots = await this.slotsRepo.count({
      where: {
        doctorId,
        startsAt: MoreThanOrEqual(new Date()),
      },
    })
    if (existingSlots > 0) return

    const slots: AppointmentSlot[] = []
    const startDay = new Date()
    startDay.setHours(0, 0, 0, 0)

    for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
      const day = new Date(startDay)
      day.setDate(startDay.getDate() + dayOffset)
      const weekDay = day.getDay()
      if (weekDay === 0 || weekDay === 6) continue

      for (let hour = 9; hour < 17; hour += 1) {
        const startsAt = new Date(day)
        startsAt.setHours(hour, 0, 0, 0)
        if (startsAt <= new Date()) continue

        const endsAt = new Date(startsAt)
        endsAt.setMinutes(endsAt.getMinutes() + 45)
        slots.push(this.slotsRepo.create({
          doctorId,
          startsAt,
          endsAt,
          status: 'available',
        }))
      }
    }

    if (slots.length > 0) {
      await this.slotsRepo.save(slots)
    }
  }
}
