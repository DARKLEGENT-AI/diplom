import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('statistics_week')
export class StatisticsWeek {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  regionId!: string

  @Column()
  serviceId!: string

  @Column({ default: 0 })
  count!: number
}
