import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Session } from './session.entity'

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  session!: Session

  @Column({ nullable: true })
  displayName?: string

  @Column({ nullable: true })
  anonymousId?: string

  @CreateDateColumn()
  joinedAt!: Date
}
