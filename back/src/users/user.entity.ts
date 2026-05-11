import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { UserRole } from '../common/enums/role.enum'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  email!: string

  @Column()
  passwordHash!: string

  @Column({ nullable: true })
  name?: string

  @Column({ nullable: true })
  region?: string

  @Column({ nullable: true })
  city?: string

  @Column({ type: 'timestamp', nullable: true })
  locationConfirmedAt?: Date

  @Column({ nullable: true })
  avatarUrl?: string

  @Column({ nullable: true })
  specialty?: string

  @Column({ nullable: true })
  doctorDescription?: string

  @Column({ nullable: true })
  office?: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Patient })
  role!: UserRole

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
