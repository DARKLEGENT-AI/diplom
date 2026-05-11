import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  patientId!: string

  @Column({ nullable: true })
  doctorId?: string

  @Column({ nullable: true })
  doctorName?: string

  @Column()
  serviceId!: string

  @Column({ type: 'timestamp' })
  date!: Date

  @Column({ default: 'planned' })
  status!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
