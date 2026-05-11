import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Session, SessionStatus } from './session.entity'
import { CreateSessionDto } from './dto/create-session.dto'
import { SurveysService } from '../surveys/surveys.service'
import { User } from '../users/user.entity'
import { UserRole } from '../common/enums/role.enum'
import { AuthUser } from '../common/types/auth-user'
import { ControlSessionDto, SessionControlAction } from './dto/control-session.dto'
import { Participant } from './participant.entity'
import { JoinSessionDto } from './dto/join-session.dto'
import { Response } from './response.entity'
import { SubmitAnswerDto } from './dto/submit-answer.dto'
import { Question } from '../surveys/question.entity'
import { SessionsGateway } from './sessions.gateway'

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private readonly sessionsRepo: Repository<Session>,
    @InjectRepository(Participant) private readonly participantsRepo: Repository<Participant>,
    @InjectRepository(Response) private readonly responsesRepo: Repository<Response>,
    @InjectRepository(Question) private readonly questionsRepo: Repository<Question>,
    private readonly surveysService: SurveysService,
    private readonly gateway: SessionsGateway,
  ) {}

  async create(surveyId: string, dto: CreateSessionDto, user: AuthUser): Promise<Session> {
    const survey = await this.surveysService.getById(surveyId, user)
    const code = dto.code ?? this.generateCode()
    const session = this.sessionsRepo.create({
      survey,
      code,
      status: SessionStatus.Scheduled,
      settings: dto.settings ?? {},
    })
    const saved = await this.sessionsRepo.save(session)
    this.gateway.broadcastSessionUpdate(saved.id, saved)
    return saved
  }

  async getById(id: string, user: AuthUser): Promise<Session> {
    const session = await this.sessionsRepo.findOne({ where: { id }, relations: ['survey', 'survey.owner'] })
    if (!session) throw new NotFoundException('РљРѕРјРЅР°С‚Р° РЅРµ РЅР°Р№РґРµРЅР°')
    if (user.role !== UserRole.Admin && session.survey.owner.id !== user.id) {
      throw new ForbiddenException('Access denied')
    }
    return session
  }

  async getByCode(code: string): Promise<Session> {
    const session = await this.sessionsRepo.findOne({ where: { code }, relations: ['survey', 'survey.questions'] })
    if (!session) throw new NotFoundException('РљРѕРјРЅР°С‚Р° РЅРµ РЅР°Р№РґРµРЅР°')
    return session
  }

  async list(user: AuthUser, status?: SessionStatus): Promise<Session[]> {
    const qb = this.sessionsRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.survey', 'survey')
      .leftJoinAndSelect('survey.owner', 'owner')
      .loadRelationCountAndMap('session.participantsCount', 'session.participants')
      .orderBy('session.createdAt', 'DESC')

    if (status) {
      qb.andWhere('session.status = :status', { status })
    }

    if (user.role !== UserRole.Admin) {
      qb.andWhere('owner.id = :ownerId', { ownerId: user.id })
    }

    return qb.getMany()
  }

  async publicSnapshot(code: string) {
    const session = await this.getByCode(code)
    const requireName = Boolean((session.settings as any)?.requireName)
    const questions = [...(session.survey.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)
    const currentQuestion =
      questions.find((question) => question.id === session.currentQuestionId) ?? questions[0]

    const responses = await this.responsesRepo.find({
      where: { session: { id: session.id } },
    })

    const resultsByQuestion = questions.map((question) => {
      const optionItems = Array.isArray((question.options as any)?.items)
        ? ((question.options as any).items as Array<string | { label?: string }>)
        : []
      const counts = optionItems.map((item, index) => ({
        label: typeof item === 'string' ? item : item?.label ?? `Option ${index + 1}`,
        value: 0,
      }))
      if (!counts.length) {
        return {
          questionId: question.id,
          text: question.text,
          counts: [],
          total: 0,
        }
      }
      const questionResponses = responses.filter((response) => response.question.id === question.id)
      for (const response of questionResponses) {
        const optionIndex = Number((response.answer as any)?.optionIndex)
        if (Number.isFinite(optionIndex) && counts[optionIndex]) {
          counts[optionIndex].value += 1
        }
      }
      const total = counts.reduce((sum, item) => sum + item.value, 0)
      return {
        questionId: question.id,
        text: question.text,
        counts,
        total,
      }
    })

    if (!currentQuestion) {
      return {
        sessionId: session.id,
        code: session.code,
        status: session.status,
        participants: 0,
        requireName,
        surveyTitle: session.survey.title,
        resultsByQuestion,
        questions: questions.map((question) => ({
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options ?? {},
          settings: question.settings ?? {},
          orderIndex: question.orderIndex,
        })),
        question: null,
        results: [],
      }
    }

    const responsesForCurrent = responses.filter((response) => response.question.id === currentQuestion.id)
    const participants = await this.participantsRepo.count({ where: { session: { id: session.id } } })

    const optionItems = Array.isArray((currentQuestion.options as any)?.items)
      ? (currentQuestion.options as any).items
      : []

    const counts = optionItems.map((item: any, index: number) => ({
      label: typeof item === "string" ? item : item?.label ?? `Option ${index + 1}`,
      value: 0,
    }))

    for (const response of responsesForCurrent) {
      const optionIndex = Number((response.answer as any)?.optionIndex)
      if (Number.isFinite(optionIndex) && counts[optionIndex]) {
        counts[optionIndex].value += 1
      }
    }

    return {
      sessionId: session.id,
      code: session.code,
      status: session.status,
      participants,
      requireName,
      surveyTitle: session.survey.title,
      resultsByQuestion,
      questions: questions.map((question) => ({
        id: question.id,
        text: question.text,
        type: question.type,
        options: question.options ?? {},
        settings: question.settings ?? {},
        orderIndex: question.orderIndex,
      })),
      question: {
        id: currentQuestion.id,
        text: currentQuestion.text,
        type: currentQuestion.type,
      },
      results: counts,
    }
  }

  async control(id: string, dto: ControlSessionDto, user: AuthUser): Promise<Session> {
    const session = await this.getById(id, user)
    if (dto.action === SessionControlAction.Start) {
      session.status = SessionStatus.Active
      session.startedAt = new Date()
    }
    if (dto.action === SessionControlAction.Advance) {
      session.currentQuestionId = dto.currentQuestionId
    }
    if (dto.action === SessionControlAction.End) {
      session.status = SessionStatus.Closed
      session.endedAt = new Date()
    }
    const saved = await this.sessionsRepo.save(session)
    this.gateway.broadcastSessionUpdate(saved.id, saved)
    return saved
  }

  async join(code: string, dto: JoinSessionDto): Promise<Participant> {
    const session = await this.getByCode(code)
    if (session.status === SessionStatus.Closed) {
      throw new BadRequestException('Комната закрыта')
    }
    const requireName = Boolean((session.settings as any)?.requireName)
    if (requireName && !dto.displayName?.trim()) {
      throw new BadRequestException('Имя обязательно для входа')
    }
    const participant = this.participantsRepo.create({
      session,
      displayName: dto.displayName?.trim() || undefined,
      anonymousId: dto.displayName ? undefined : this.generateAnonymousId(),
    })
    return this.participantsRepo.save(participant)
  }

  async submitAnswer(code: string, dto: SubmitAnswerDto): Promise<Response> {
    const session = await this.getByCode(code)
    if (session.status !== SessionStatus.Active) {
      throw new BadRequestException('Комната не активна')
    }
    const question = await this.questionsRepo.findOne({
      where: { id: dto.questionId },
      relations: ['survey'],
    })
    if (!question || question.survey.id !== session.survey.id) {
      throw new BadRequestException('Invalid question')
    }
    const participant = dto.participantId
      ? await this.participantsRepo.findOne({ where: { id: dto.participantId } })
      : undefined
    const response = this.responsesRepo.create({
      session,
      question,
      participant: participant ?? undefined,
      answer: dto.answer,
    })
    const saved = await this.responsesRepo.save(response)
    this.gateway.broadcastAnswer(session.id, saved)
    return saved
  }

  async analyticsBySession(id: string, user: AuthUser) {
    const session = await this.getById(id, user)
    const totalParticipants = await this.participantsRepo.count({ where: { session: { id: session.id } } })
    const totalResponses = await this.responsesRepo.count({ where: { session: { id: session.id } } })
    const perQuestion = await this.responsesRepo
      .createQueryBuilder('response')
      .select('response.questionId', 'questionId')
      .addSelect('COUNT(*)', 'count')
      .where('response.sessionId = :sessionId', { sessionId: session.id })
      .groupBy('response.questionId')
      .getRawMany()

    return {
      sessionId: session.id,
      status: session.status,
      totalParticipants,
      totalResponses,
      perQuestion,
    }
  }

  async responsesBySession(id: string, user: AuthUser) {
    const session = await this.getById(id, user)
    const responses = await this.responsesRepo.find({
      where: { session: { id: session.id } },
      relations: ['participant', 'question'],
      order: { createdAt: 'DESC' },
    })

    return responses.map((response) => ({
      id: response.id,
      createdAt: response.createdAt,
      question: {
        id: response.question.id,
        text: response.question.text,
        type: response.question.type,
        options: response.question.options ?? {},
      },
      participant: response.participant
        ? {
            id: response.participant.id,
            displayName: response.participant.displayName,
            anonymousId: response.participant.anonymousId,
          }
        : null,
      answer: response.answer,
    }))
  }
  async delete(id: string, user: AuthUser): Promise<void> {
    const session = await this.getById(id, user)
    await this.sessionsRepo.remove(session)
  }

  private generateCode(): string {
    const digits = Math.floor(1000 + Math.random() * 9000)
    return `PS-${digits}`
  }

  private generateAnonymousId(): string {
    const digits = Math.floor(100000 + Math.random() * 900000)
    return `anon-${digits}`
  }
}





