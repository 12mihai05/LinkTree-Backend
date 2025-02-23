import {
  ForbiddenException,
  Injectable,
  NotFoundException,
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

  getLinks(userId: number, folderId?: number) {
    return this.prisma.link.findMany({
      where: {
        userId,
        folderId, // Optionally filter by folderId
      },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });
  }

  async getOtherUserLinks(
    username: string,
    folderId?: number,
  ) {
    const otherUserId =
      await this.prisma.user.findUnique({
        where: { username },
        select: { id: true }, // Get only the user ID
      });

    return this.prisma.link.findMany({
      where: {
        userId: Number(otherUserId.id),
        folderId,
      },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });
  }

  async getLinksFromFolder(
    userId: number,
    folderId: number,
  ) {
    // Check if the folder exists
    const folder =
      await this.prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

    if (!folder) {
      throw new NotFoundException(
        'Folder not found',
      );
    }

    return this.prisma.link.findMany({
      where: {
        folderId: folder.id,
        userId,
      },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });
  }

  async getLinkById(
    userId: number,
    linkId: number,
  ) {
    const link = await this.prisma.link.findFirst(
      {
        where: {
          id: linkId,
          userId,
        },
      },
    );

    if (!link) {
      throw new NotFoundException(
        'Link not found',
      );
    }

    return link;
  }

  async createLink(
    userId: number,
    dto: CreateLinkDto,
    req: Express.Request,
  ) {
    // Validate folder existence if provided
    if (dto.folderId) {
      const folder =
        await this.prisma.folder.findFirst({
          where: { id: dto.folderId, userId },
        });

      if (!folder) {
        throw new NotFoundException(
          'Folder not found',
        );
      }
    }

    const link = await this.prisma.link.create({
      data: {
        userId,
        ...dto,
      },
    });

    // Update session with new link
    req.session.allItems.push({
      ...link,
      type: 'link',
    });

    req.session.allItems.sort(
      (a, b) =>
        (a.position ?? Infinity) -
          (b.position ?? Infinity) ||
        new Date(a.createAt).getTime() -
          new Date(b.createAt).getTime(),
    );

    console.log(
      'Updated session.allItems:',
      req.session.allItems,
    );

    return link;
  }

  async editLinkById(
    userId: number,
    linkId: number,
    dto: EditLinkDto,
  ) {
    const link =
      await this.prisma.link.findUnique({
        where: { id: linkId },
      });

    if (!link || link.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    return this.prisma.link.update({
      where: { id: linkId },
      data: { ...dto },
    });
  }

  async deleteLinkById(
    userId: number,
    linkId: number,
    req: Express.Request,
  ) {
    const link =
      await this.prisma.link.findUnique({
        where: { id: linkId },
      });

    if (!link || link.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    // Delete the link
    await this.prisma.link.delete({
      where: { id: linkId },
    });

    // Remove the link from session
    if (req.session.allItems) {
      req.session.allItems =
        req.session.allItems.filter(
          (item) => item.id !== linkId,
        );
    }
  }

  // Move link to another folder
  async moveLinkToAnotherFolder(
    userId: number,
    linkId: number,
    folderId: number,
  ) {
    const link =
      await this.prisma.link.findUnique({
        where: { id: linkId },
      });

    if (!link || link.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    const folder =
      await this.prisma.folder.findUnique({
        where: { id: folderId },
      });

    if (!folder || folder.userId !== userId) {
      throw new ForbiddenException(
        'Folder not found or not owned by user',
      );
    }

    // Move the link by updating its folderId
    return this.prisma.link.update({
      where: { id: linkId },
      data: { folderId },
    });
  }
}
