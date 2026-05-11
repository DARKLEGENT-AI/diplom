import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('appointment_slots')
export class AppointmentSlot {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  doctorId!: string

  @Column({ type: 'varchar', nullable: true })
  serviceId?: string | null

  @Column({ type: 'timestamp' })
  startsAt!: Date

  @Column({ type: 'timestamp' })
  endsAt!: Date

  @Column({ type: 'varchar', nullable: true })
  patientUserId?: string | null

  @Column({ default: 'available' })
  status!: 'available' | 'booked' | 'cancelled'

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
