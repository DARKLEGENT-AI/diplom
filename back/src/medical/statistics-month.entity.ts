import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('statistics_month')
export class StatisticsMonth {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  serviceId!: string

  @Column({ default: 0 })
  count!: number
}
