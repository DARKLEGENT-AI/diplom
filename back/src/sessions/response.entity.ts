import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Session } from './session.entity'
import { Question } from '../surveys/question.entity'
import { Participant } from './participant.entity'

@Entity('responses')
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  session!: Session

  @ManyToOne(() => Question, { eager: true, onDelete: 'CASCADE' })
  question!: Question

  @ManyToOne(() => Participant, { nullable: true, onDelete: 'SET NULL' })
  participant?: Participant

  @Column({ type: 'jsonb' })
  answer!: Record<string, unknown>

  @CreateDateColumn()
  createdAt!: Date
}
