import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  parentId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  position?: number;
}
