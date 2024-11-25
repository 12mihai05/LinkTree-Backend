import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  CreateLinkDto,
  EditLinkDto,
  UpdatePosDto,
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
      orderBy: [
        { position: 'asc' },  // Sort first by position
        { createAt: 'asc' },  // Then sort by created time in case of position conflicts
      ],
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

    // Method to update the positions of all links
    async updatePos(userId: number, links: UpdatePosDto[]) {
      // Extract the link ids from the body to verify if all belong to the user
      const linkIds = links.map((link) => link.id);
  
      // Get the links belonging to the user from the database
      const userLinks = await this.prisma.link.findMany({
        where: {
          userId,
          id: { in: linkIds },
        },
      });
  
      // Check if all provided links belong to the user
      if (userLinks.length !== links.length) {
        throw new ForbiddenException('Some links do not belong to the user');
      }
  
      // Start a transaction to update positions
      const updatePromises = links.map((link) =>
        this.prisma.link.update({
          where: { id: link.id },
          data: { position: link.position },
        }),
      );
  
      // Execute all updates in one transaction
      await this.prisma.$transaction(updatePromises);
  
      // Return the updated list of links, ordered by position
      return this.prisma.link.findMany({
        where: { userId },
        orderBy: { position: 'asc' },
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
