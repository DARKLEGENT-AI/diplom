import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { SessionsService } from './sessions.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AuthUser } from '../common/types/auth-user'
import { CreateSessionDto } from './dto/create-session.dto'
import { ControlSessionDto } from './dto/control-session.dto'
import { JoinSessionDto } from './dto/join-session.dto'
import { SubmitAnswerDto } from './dto/submit-answer.dto'

@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('surveys/:id/sessions')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('id') surveyId: string,
    @Body() dto: CreateSessionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sessionsService.create(surveyId, dto, user)
  }

  @Get('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.sessionsService.getById(id, user)
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: AuthUser, @Query('status') status?: string) {
    return this.sessionsService.list(user, status as any)
  }

  @Get('sessions/code/:code')
  async getByCode(@Param('code') code: string) {
    return this.sessionsService.publicSnapshot(code)
  }

  @Patch('sessions/:id/control')
  @UseGuards(JwtAuthGuard)
  async control(@Param('id') id: string, @Body() dto: ControlSessionDto, @CurrentUser() user: AuthUser) {
    return this.sessionsService.control(id, dto, user)
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.sessionsService.delete(id, user)
    return { ok: true }
  }

  @Post('sessions/:code/join')
  async join(@Param('code') code: string, @Body() dto: JoinSessionDto) {
    return this.sessionsService.join(code, dto)
  }

  @Post('sessions/:code/answers')
  async answer(@Param('code') code: string, @Body() dto: SubmitAnswerDto) {
    return this.sessionsService.submitAnswer(code, dto)
  }

  @Get('sessions/:id/analytics')
  @UseGuards(JwtAuthGuard)
  async analytics(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.sessionsService.analyticsBySession(id, user)
  }

  @Get('sessions/:id/responses')
  @UseGuards(JwtAuthGuard)
  async responses(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.sessionsService.responsesBySession(id, user)
  }
}
