import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/enums/role.enum'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UpdateLocationDto } from './dto/update-location.dto'
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto'
import { avatarsUploadDir } from '../common/upload-paths'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.Admin)
  async list() {
    return this.usersService.list()
  }

  @Get(':id')
  @Roles(UserRole.Admin)
  async get(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          fs.mkdirSync(avatarsUploadDir, { recursive: true })
          callback(null, avatarsUploadDir)
        },
        filename: (_, file, callback) => {
          const ext = path.extname(file.originalname) || '.png'
          const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`
          callback(null, safeName)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(@CurrentUser() user: { id: string }, @UploadedFile() file?: any) {
    if (!file) {
      return this.usersService.findPublicById(user.id)
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`
    return this.usersService.updateAvatar(user.id, avatarUrl)
  }

  @Post('me/location')
  async updateLocation(@CurrentUser() user: { id: string }, @Body() dto: UpdateLocationDto) {
    return this.usersService.updateLocation(user.id, dto.city, dto.region)
  }

  @Post('me/doctor-profile')
  async updateDoctorProfile(@CurrentUser() user: { id: string }, @Body() dto: UpdateDoctorProfileDto) {
    return this.usersService.updateDoctorProfile(user.id, dto)
  }
}
