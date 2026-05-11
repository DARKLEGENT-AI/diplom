import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as express from 'express'
import { AppModule } from './app.module'
import { uploadsRoot } from './common/upload-paths'

let cachedServer: express.Express | undefined

async function createServer() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.use('/uploads', express.static(uploadsRoot))
  app.setGlobalPrefix('v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  await app.init()
  return app.getHttpAdapter().getInstance() as express.Express
}

export default async function handler(req: express.Request, res: express.Response) {
  if (!cachedServer) {
    cachedServer = await createServer()
  }
  return cachedServer(req, res)
}

async function bootstrap() {
  const server = await createServer()
  const port = process.env.PORT || 4000
  server.listen(port)
}

if (!process.env.VERCEL) {
  bootstrap()
}
