import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Survey } from './survey.entity'
import { CreateSurveyDto } from './dto/create-survey.dto'
import { UpdateSurveyDto } from './dto/update-survey.dto'
import { Question } from './question.entity'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { User } from '../users/user.entity'
import { UserRole } from '../common/enums/role.enum'
import { AuthUser } from '../common/types/auth-user'

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey) private readonly surveysRepo: Repository<Survey>,
    @InjectRepository(Question) private readonly questionsRepo: Repository<Question>,
  ) {}

  async create(dto: CreateSurveyDto, owner: AuthUser): Promise<Survey> {
    const survey = this.surveysRepo.create({
      ...dto,
      owner: { id: owner.id } as User,
      config: dto.config ?? {},
    })
    return this.surveysRepo.save(survey)
  }

  async list(user: AuthUser): Promise<Survey[]> {
    if (user.role === UserRole.Admin) {
      return this.surveysRepo.find({ order: { createdAt: 'DESC' }, relations: ['questions'] })
    }
    return this.surveysRepo.find({
      where: { owner: { id: user.id } },
      order: { createdAt: 'DESC' },
      relations: ['questions'],
    })
  }

  async getById(id: string, user: AuthUser): Promise<Survey> {
    const survey = await this.surveysRepo.findOne({ where: { id }, relations: ['questions', 'owner'] })
    if (!survey) throw new NotFoundException('Survey not found')
    if (user.role !== UserRole.Admin && survey.owner.id !== user.id) {
      throw new ForbiddenException('Access denied')
    }
    return survey
  }

  async update(id: string, dto: UpdateSurveyDto, user: AuthUser): Promise<Survey> {
    const survey = await this.getById(id, user)
    Object.assign(survey, {
      ...dto,
      config: dto.config ?? survey.config,
    })
    return this.surveysRepo.save(survey)
  }

  async addQuestion(surveyId: string, dto: CreateQuestionDto, user: AuthUser): Promise<Question> {
    const survey = await this.getById(surveyId, user)
    const question = this.questionsRepo.create({
      ...dto,
      survey,
      options: dto.options ?? {},
      settings: dto.settings ?? {},
      orderIndex: dto.orderIndex ?? survey.questions.length,
    })
    return this.questionsRepo.save(question)
  }

  async updateQuestion(
    surveyId: string,
    questionId: string,
    dto: UpdateQuestionDto,
    user: AuthUser,
  ): Promise<Question> {
    await this.getById(surveyId, user)
    const question = await this.questionsRepo.findOne({ where: { id: questionId }, relations: ['survey'] })
    if (!question || question.survey.id !== surveyId) {
      throw new NotFoundException('Question not found')
    }
    Object.assign(question, {
      ...dto,
      options: dto.options ?? question.options,
      settings: dto.settings ?? question.settings,
    })
    return this.questionsRepo.save(question)
  }

  async deleteQuestion(surveyId: string, questionId: string, user: AuthUser): Promise<void> {
    await this.getById(surveyId, user)
    const question = await this.questionsRepo.findOne({ where: { id: questionId }, relations: ['survey'] })
    if (!question || question.survey.id !== surveyId) {
      throw new NotFoundException('Question not found')
    }
    await this.questionsRepo.remove(question)
  }

  async deleteSurvey(id: string, user: AuthUser): Promise<void> {
    const survey = await this.getById(id, user)
    await this.surveysRepo.remove(survey)
  }
}
