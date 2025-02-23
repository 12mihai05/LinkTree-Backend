import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditFolderDto {
  @IsString()
  @IsOptional()
  title?: string;
}
