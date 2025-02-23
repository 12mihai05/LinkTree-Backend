import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
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
    delete user.hash;
    return user;
  }

  @Get(':username')
  getOtherUsers(
    @Param('username') username: string,
  ) {
    return this.userService.getOtherUsers(
      username,
    );
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      multerOptions,
    ),
  )
  async editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.editUser(
      userId,
      dto,
      file,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async deleteUser(
    @GetUser('id') userId: number,
  ) {
    return this.userService.deleteUser(userId);
  }
}
