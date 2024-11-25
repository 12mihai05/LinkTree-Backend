import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './multer-options';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser('') user: User) {
    return user;
  }

  @Patch()
  @UseInterceptors(FileInterceptor('profileImage', multerOptions))
  async editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.editUser(userId, dto, file);
  }
}