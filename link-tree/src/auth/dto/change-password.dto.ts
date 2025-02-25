import { IsNotEmpty, IsString, Length } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 20)
    newPassword: string;
  }
  