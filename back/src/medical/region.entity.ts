import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  name!: string

  @Column({ nullable: true })
  district?: string

  @Column({ nullable: true })
  code?: string
}
