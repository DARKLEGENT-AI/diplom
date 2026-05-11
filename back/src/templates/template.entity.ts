import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../users/user.entity'

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'jsonb' })
  snapshot!: Record<string, unknown>

  @ManyToOne(() => User, { eager: true })
  owner!: User

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
