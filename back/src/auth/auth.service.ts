import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UserRole } from '../common/enums/role.enum'

const ADMIN_EMAIL = '123456789@list.ru'

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) {
      throw new BadRequestException('Email already registered')
    }
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const requestedRole = Object.values(UserRole).includes(dto.role as UserRole) ? (dto.role as UserRole) : UserRole.Patient
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      city: dto.city,
      region: dto.city,
      specialty: requestedRole === UserRole.Doctor ? dto.specialty || 'Врач общей практики' : undefined,
      role: dto.email.toLowerCase() === ADMIN_EMAIL ? UserRole.Admin : requestedRole,
    })
    return this.signToken(user.id, user.email, user.role)
  }

  async login(dto: LoginDto) {
    let user = await this.usersService.findByEmail(dto.email)
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')
    if (dto.email.toLowerCase() === ADMIN_EMAIL && user.role !== UserRole.Admin) {
      user = await this.usersService.updateRole(user.id, UserRole.Admin)
    }
    return this.signToken(user.id, user.email, user.role)
  }

  async signToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    return {
      accessToken: await this.jwtService.signAsync(payload),
    }
  }
}
