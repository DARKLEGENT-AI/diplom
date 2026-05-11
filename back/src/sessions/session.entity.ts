import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Survey } from '../surveys/survey.entity'
import { Participant } from './participant.entity'

export enum SessionStatus {
  Scheduled = 'scheduled',
  Active = 'active',
  Closed = 'closed',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Survey, { eager: true, onDelete: 'CASCADE' })
  survey!: Survey

  @Column({ unique: true })
  code!: string

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.Scheduled })
  status!: SessionStatus

  @Column({ nullable: true })
  currentQuestionId?: string

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, unknown>

  @OneToMany(() => Participant, (participant) => participant.session)
  participants?: Participant[]

  participantsCount?: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
