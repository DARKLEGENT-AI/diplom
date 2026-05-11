import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../users/user.entity'
import { Question } from './question.entity'

export enum SurveyStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'enum', enum: SurveyStatus, default: SurveyStatus.Draft })
  status!: SurveyStatus

  @Column({ type: 'jsonb', default: {} })
  config!: Record<string, unknown>

  @ManyToOne(() => User, { eager: true })
  owner!: User

  @OneToMany(() => Question, (question) => question.survey, { cascade: true })
  questions!: Question[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
