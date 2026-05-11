import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as path from 'path'
import * as express from 'express'
import { AppModule } from './app.module'

const allowedOrigins = [
  'http://localhost:5173',
  'https://diplom-back-alpha.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/.+\.vercel\.app$/.test(origin)) {
      callback(null, true)
      return
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`))
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors(corsOptions)

  const expressApp = app.getHttpAdapter().getInstance()
  expressApp.options('*', (_req, res) => {
    res.sendStatus(204)
  })

  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))
  app.setGlobalPrefix('v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  const port = process.env.PORT || 4000
  await app.listen(port)
}

bootstrap()
