import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import PDFDocument = require('pdfkit')
import * as ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'
import { Response } from '../sessions/response.entity'
import { Session } from '../sessions/session.entity'
import { SurveysService } from '../surveys/surveys.service'
import { AuthUser } from '../common/types/auth-user'

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Response) private readonly responsesRepo: Repository<Response>,
    @InjectRepository(Session) private readonly sessionsRepo: Repository<Session>,
    private readonly surveysService: SurveysService,
  ) {}

  async surveySummary(surveyId: string, user: AuthUser) {
    const survey = await this.surveysService.getById(surveyId, user)
    const totalSessions = await this.sessionsRepo.count({ where: { survey: { id: survey.id } } })
    const totalResponses = await this.responsesRepo
      .createQueryBuilder('response')
      .innerJoin('response.session', 'session')
      .where('session.surveyId = :surveyId', { surveyId })
      .getCount()

    const perQuestion = await this.responsesRepo
      .createQueryBuilder('response')
      .select('response.questionId', 'questionId')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('response.session', 'session')
      .where('session.surveyId = :surveyId', { surveyId })
      .groupBy('response.questionId')
      .getRawMany()

    return {
      surveyId: survey.id,
      totalSessions,
      totalResponses,
      perQuestion,
    }
  }

  async exportSurvey(surveyId: string, user: AuthUser, format: string) {
    const normalized = format?.toLowerCase?.() ?? 'csv'
    const exportFormat = ['pdf', 'xlsx', 'csv'].includes(normalized) ? normalized : null
    if (!exportFormat) {
      throw new BadRequestException('Неверный формат экспорта')
    }

    const survey = await this.surveysService.getById(surveyId, user)
    const totalSessions = await this.sessionsRepo.count({ where: { survey: { id: survey.id } } })
    const responses = await this.responsesRepo
      .createQueryBuilder('response')
      .innerJoin('response.session', 'session')
      .innerJoinAndSelect('response.question', 'question')
      .where('session.surveyId = :surveyId', { surveyId })
      .orderBy('response.createdAt', 'ASC')
      .getMany()

    const totalResponses = responses.length
    const questions = [...(survey.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)
    const responsesByQuestion = new Map<string, Response[]>()
    for (const response of responses) {
      const list = responsesByQuestion.get(response.question.id) ?? []
      list.push(response)
      responsesByQuestion.set(response.question.id, list)
    }

    const questionRows = questions.map((question) => {
      const questionResponses = responsesByQuestion.get(question.id) ?? []
      const optionItems = Array.isArray((question.options as any)?.items)
        ? ((question.options as any).items as Array<string | { label?: string }>)
        : []
      if (optionItems.length) {
        const counts = optionItems.map((item, index) => ({
          label: typeof item === 'string' ? item : item?.label ?? `Option ${index + 1}`,
          count: 0,
        }))
        for (const response of questionResponses) {
          const optionIndex = Number((response.answer as any)?.optionIndex)
          if (Number.isFinite(optionIndex) && counts[optionIndex]) {
            counts[optionIndex].count += 1
          }
        }
        return { question, rows: counts.map((item) => ({ answer: item.label, count: item.count })) }
      }

      const valueCounts = new Map<string, number>()
      for (const response of questionResponses) {
        const rawValue =
          (response.answer as any)?.text ??
          (response.answer as any)?.value ??
          (response.answer as any)?.number ??
          (response.answer as any)?.answer ??
          ''
        const value = String(rawValue ?? '')
        valueCounts.set(value, (valueCounts.get(value) ?? 0) + 1)
      }
      const rows = Array.from(valueCounts.entries()).map(([answer, count]) => ({ answer, count }))
      return { question, rows }
    })

    const now = new Date()
    const safeTitle = (survey.title ?? 'survey').replace(/[\\/:*?"<>|]+/g, '-')
    const asciiTitle = safeTitle.replace(/[^\x20-\x7E]/g, '-')

    if (exportFormat === 'csv') {
      const rows: string[][] = [
        ['Отчет', survey.title ?? 'Опрос'],
        ['Дата', now.toLocaleString('ru-RU')],
        ['Комнат всего', `${totalSessions}`],
        ['Ответов всего', `${totalResponses}`],
        [],
        ['Вопрос', 'Тип', 'Ответ', 'Кол-во'],
      ]
      for (const item of questionRows) {
        if (!item.rows.length) {
          rows.push([item.question.text, item.question.type, '—', '0'])
          continue
        }
        for (const row of item.rows) {
          rows.push([item.question.text, item.question.type, row.answer, `${row.count}`])
        }
      }
      const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
      return {
        buffer: Buffer.from(csv, 'utf8'),
        contentType: 'text/csv; charset=utf-8',
        filename: `meduchet-${safeTitle}-${now.toISOString().slice(0, 10)}.csv`,
        filenameAscii: `meduchet-${asciiTitle}-${now.toISOString().slice(0, 10)}.csv`,
      }
    }

    if (exportFormat === 'xlsx') {
      const workbook = new ExcelJS.Workbook()
      const summary = workbook.addWorksheet('Summary')
      summary.addRow(['Отчет', survey.title ?? 'Опрос'])
      summary.addRow(['Дата', now.toLocaleString('ru-RU')])
      summary.addRow(['Комнат всего', totalSessions])
      summary.addRow(['Ответов всего', totalResponses])
      summary.addRow([])

      const details = workbook.addWorksheet('Questions')
      details.columns = [
        { header: 'Вопрос', key: 'question', width: 45 },
        { header: 'Тип', key: 'type', width: 14 },
        { header: 'Ответ', key: 'answer', width: 30 },
        { header: 'Кол-во', key: 'count', width: 10 },
      ]
      for (const item of questionRows) {
        if (!item.rows.length) {
          details.addRow({
            question: item.question.text,
            type: item.question.type,
            answer: '—',
            count: 0,
          })
          continue
        }
        for (const row of item.rows) {
          details.addRow({
            question: item.question.text,
            type: item.question.type,
            answer: row.answer,
            count: row.count,
          })
        }
      }
      const buffer = await workbook.xlsx.writeBuffer()
      return {
        buffer: Buffer.from(buffer),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `meduchet-${safeTitle}-${now.toISOString().slice(0, 10)}.xlsx`,
        filenameAscii: `meduchet-${asciiTitle}-${now.toISOString().slice(0, 10)}.xlsx`,
      }
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []
    const bufferPromise = new Promise<Buffer>((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk as Buffer))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
    })
    const fontPath = this.resolveFontPath()
    if (fontPath) {
      doc.font(fontPath)
    }
    doc.fontSize(18).text(`Отчет по опросу: ${survey.title ?? 'Опрос'}`)
    doc.moveDown(0.5)
    doc.fontSize(12).text(`Дата: ${now.toLocaleString('ru-RU')}`)
    doc.text(`Комнат всего: ${totalSessions}`)
    doc.text(`Ответов всего: ${totalResponses}`)
    doc.moveDown()
    for (const item of questionRows) {
      doc.fontSize(13).text(item.question.text)
      doc.fontSize(10).fillColor('#64748b').text(`Тип: ${item.question.type}`)
      doc.fillColor('#111827')
      if (!item.rows.length) {
        doc.text('—')
        doc.moveDown()
        continue
      }
      for (const row of item.rows) {
        doc.text(`${row.answer || '—'}: ${row.count}`)
      }
      doc.moveDown()
    }
    doc.end()
    const pdfBuffer = await bufferPromise
    return {
      buffer: pdfBuffer,
      contentType: 'application/pdf',
      filename: `meduchet-${safeTitle}-${now.toISOString().slice(0, 10)}.pdf`,
      filenameAscii: `meduchet-${asciiTitle}-${now.toISOString().slice(0, 10)}.pdf`,
    }
  }

  private resolveFontPath(): string | null {
    const candidates = [
      process.env.POLLSYNC_FONT_PATH,
      path.resolve(__dirname, '../../assets/fonts/DejaVuSans.ttf'),
      'C:\\Windows\\Fonts\\arial.ttf',
      'C:\\Windows\\Fonts\\times.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/Library/Fonts/Arial Unicode.ttf',
      '/Library/Fonts/Arial.ttf',
    ].filter(Boolean) as string[]

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate
      }
    }
    return null
  }
}
