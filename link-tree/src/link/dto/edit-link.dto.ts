import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class EditLinkDto {
  @IsString()
  @IsOptional()
  title?: string;
  
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  link?: string;
}
