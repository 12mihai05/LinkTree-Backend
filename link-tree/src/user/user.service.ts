import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getOtherUsers(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  
    // Delete the 'hash' field before returning the user object
    if (user) {
      delete user.hash;
    }
  
    return user;
  }

  async editUser(
    userId: number,
    dto: EditUserDto,
    file?: Express.Multer.File,
  ) {
    const currentUser =
      await this.prisma.user.findUnique({
        where: { id: userId },
      });

    if (!currentUser) {
      throw new Error('User not found');
    }

    // If a new file is uploaded, handle the profile image update
    if (file) {
      // Delete the old profile image if it exists
      if (currentUser.profileImage) {
        const oldImagePath = path.resolve(
          currentUser.profileImage,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set the new profile image path in the DTO
      dto.profileImage = file.path;
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;

    return user;
  }

  async deleteUser(userId: number) {
    const user =
      await this.prisma.user.findUnique({
        where: { id: userId },
      });

    if (!user) {
      throw new ForbiddenException(
        'User not found',
      );
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'User deleted successfully',
    };
  }
}
