import { Controller, Get, Param, Query, Res, StreamableFile, UseGuards } from '@nestjs/common'
import type { Response as ExpressResponse } from 'express'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AuthUser } from '../common/types/auth-user'

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('surveys/:id')
  async survey(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.analyticsService.surveySummary(id, user)
  }

  @Get('surveys/:id/export')
  async exportSurvey(
    @Param('id') id: string,
    @Query('format') format: string,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { buffer, contentType, filename, filenameAscii } = await this.analyticsService.exportSurvey(id, user, format)
    const asciiName = filenameAscii ?? filename.replace(/[^\x20-\x7E]/g, '-')
    const encoded = encodeURIComponent(filename)
    res.setHeader('Content-Type', contentType)
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiName}"; filename*=UTF-8''${encoded}`,
    )
    return new StreamableFile(buffer)
  }
}
