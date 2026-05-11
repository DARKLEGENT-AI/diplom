import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  specialty?: string

  @IsOptional()
  @IsIn(['patient', 'doctor', 'admin'])
  role?: string
}
