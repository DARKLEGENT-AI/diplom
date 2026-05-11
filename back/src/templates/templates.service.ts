import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Template } from './template.entity'
import { CreateTemplateDto } from './dto/create-template.dto'
import { User } from '../users/user.entity'
import { UserRole } from '../common/enums/role.enum'
import { AuthUser } from '../common/types/auth-user'

@Injectable()
export class TemplatesService {
  constructor(@InjectRepository(Template) private readonly templatesRepo: Repository<Template>) {}

  async create(dto: CreateTemplateDto, owner: AuthUser): Promise<Template> {
    const template = this.templatesRepo.create({ ...dto, owner: { id: owner.id } as User })
    return this.templatesRepo.save(template)
  }

  async list(user: AuthUser): Promise<Template[]> {
    if (user.role === UserRole.Admin) {
      return this.templatesRepo.find({ order: { createdAt: 'DESC' } })
    }
    return this.templatesRepo.find({ where: { owner: { id: user.id } }, order: { createdAt: 'DESC' } })
  }

  async getById(id: string, user: AuthUser): Promise<Template> {
    const template = await this.templatesRepo.findOne({ where: { id }, relations: ['owner'] })
    if (!template) throw new NotFoundException('Template not found')
    if (user.role !== UserRole.Admin && template.owner.id !== user.id) {
      throw new ForbiddenException('Access denied')
    }
    return template
  }

  async delete(id: string, user: AuthUser): Promise<void> {
    const template = await this.getById(id, user)
    await this.templatesRepo.remove(template)
  }
}
