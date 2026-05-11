import { IsEnum, IsOptional, IsString } from 'class-validator'

export enum SessionControlAction {
  Start = 'start',
  Advance = 'advance',
  End = 'end',
}

export class ControlSessionDto {
  @IsEnum(SessionControlAction)
  action!: SessionControlAction

  @IsOptional()
  @IsString()
  currentQuestionId?: string
}
