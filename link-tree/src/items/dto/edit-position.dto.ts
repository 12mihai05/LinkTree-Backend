import { IsInt, IsString } from 'class-validator';

export class UpdatePosDto {
  @IsInt()
  id: number;

  @IsString()
  type: 'folder' | 'link';

  @IsInt()
  position: number;
}
