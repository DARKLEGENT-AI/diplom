import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import configuration from './config/configuration'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SurveysModule } from './surveys/surveys.module'
import { TemplatesModule } from './templates/templates.module'
import { SessionsModule } from './sessions/sessions.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { MedicalModule } from './medical/medical.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('database.url')

        return {
          type: 'postgres',
          ...(databaseUrl
            ? {
                url: databaseUrl,
                ssl: { rejectUnauthorized: false },
              }
            : {
                host: config.get<string>('database.host'),
                port: config.get<number>('database.port'),
                username: config.get<string>('database.username'),
                password: config.get<string>('database.password'),
                database: config.get<string>('database.name'),
              }),
          autoLoadEntities: true,
          synchronize: true,
        }
      },
    }),
    AuthModule,
    UsersModule,
    SurveysModule,
    TemplatesModule,
    SessionsModule,
    AnalyticsModule,
    MedicalModule,
  ],
})
export class AppModule {}
