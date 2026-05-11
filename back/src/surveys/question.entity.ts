import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Survey } from './survey.entity'

export enum QuestionType {
  Choice = 'choice',
  MultiChoice = 'multi',
  Scale = 'scale',
  Matrix = 'matrix',
  Text = 'text',
  Number = 'number',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Survey, (survey) => survey.questions, { onDelete: 'CASCADE' })
  survey!: Survey

  @Column({ type: 'enum', enum: QuestionType })
  type!: QuestionType

  @Column()
  text!: string

  @Column({ type: 'jsonb', nullable: true })
  options?: Record<string, unknown>

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, unknown>

  @Column({ type: 'int', default: 0 })
  orderIndex!: number
}
