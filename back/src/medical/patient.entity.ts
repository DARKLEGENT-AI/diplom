import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ type: 'date' })
  birthDate!: string

  @Column()
  contacts!: string

  @Column({ nullable: true })
  regionId?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
