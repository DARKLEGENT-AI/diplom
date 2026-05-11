import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { SurveysService } from './surveys.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { CreateSurveyDto } from './dto/create-survey.dto'
import { UpdateSurveyDto } from './dto/update-survey.dto'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { AuthUser } from '../common/types/auth-user'

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  async create(@Body() dto: CreateSurveyDto, @CurrentUser() user: AuthUser) {
    return this.surveysService.create(dto, user)
  }

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    return this.surveysService.list(user)
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.surveysService.getById(id, user)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSurveyDto, @CurrentUser() user: AuthUser) {
    return this.surveysService.update(id, dto, user)
  }

  @Post(':id/questions')
  async addQuestion(@Param('id') id: string, @Body() dto: CreateQuestionDto, @CurrentUser() user: AuthUser) {
    return this.surveysService.addQuestion(id, dto, user)
  }

  @Patch(':id/questions/:questionId')
  async updateQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.surveysService.updateQuestion(id, questionId, dto, user)
  }

  @Delete(':id/questions/:questionId')
  async deleteQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.surveysService.deleteQuestion(id, questionId, user)
    return { status: 'ok' }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.surveysService.deleteSurvey(id, user)
    return { status: 'ok' }
  }
}
