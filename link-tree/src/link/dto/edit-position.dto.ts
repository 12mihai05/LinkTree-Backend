import { IsInt } from 'class-validator';

export class UpdatePosDto {
  @IsInt()
  id: number;

  @IsInt()
  position: number;
}
