import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { TemplatesService } from './templates.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CreateTemplateDto } from './dto/create-template.dto'
import { AuthUser } from '../common/types/auth-user'

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  async create(@Body() dto: CreateTemplateDto, @CurrentUser() user: AuthUser) {
    return this.templatesService.create(dto, user)
  }

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    return this.templatesService.list(user)
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.templatesService.getById(id, user)
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.templatesService.delete(id, user)
    return { status: 'ok' }
  }
}
