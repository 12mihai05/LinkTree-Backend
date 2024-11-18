import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  CreateLinkDto,
  EditLinkDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LinkService {
  constructor(private prisma: PrismaService) {}

  getLinks(userId: number) {
    return this.prisma.link.findMany({
      where: {
        userId,
      },
    });
  }

  getLinksById(userId: number, linkId: number) {
    return this.prisma.link.findFirst({
      where: {
        id: linkId,
        userId,
      },
    });
  }

  async createLink(
    userId: number,
    dto: CreateLinkDto,
  ) {
    const link = await this.prisma.link.create({
      data: {
        userId,
        ...dto,
      },
    });
    return link;
  }

  async editLinkById(
    userId: number,
    linkId: number,
    dto: EditLinkDto,
  ) {
    //get the link by id
    const link =
      await this.prisma.link.findUnique({
        where: {
          id: linkId,
        },
      });

    //check if user owns the link

    if (!link || link.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    return this.prisma.link.update({
      where: {
        id: linkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteLinkById(
    userId: number,
    linkId: number,
  ) {
    //get the link by id
    const link =
      await this.prisma.link.findUnique({
        where: {
          id: linkId,
        },
      });

    //check if user owns the link

    if (!link || link.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    await this.prisma.link.delete({
      where: {
        id: linkId,
      },
    });
  }
}
