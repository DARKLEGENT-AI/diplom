import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('services')
export class MedicalServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ nullable: true })
  description?: string

  @Column({ nullable: true })
  department?: string
}
