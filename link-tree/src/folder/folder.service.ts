import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  CreateFolderDto,
  EditFolderDto,
  UpdatePosDto,
} from './dto'; // Ensure to create these DTOs
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  // Get all folders for a user with pagination
  async getFolders(
    userId: number,
    parentId?: number,
    page: number = 1, // Default to page 1
    limit: number = 5, // Default to 5 items per page
  ) {
    const skip = (page - 1) * limit;

    const folders =
      await this.prisma.folder.findMany({
        where: {
          userId,
          parentId: parentId || null, // Only fetch child folders if parentId is provided
        },
        orderBy: [
          { position: 'asc' }, // Sort by position
          { createAt: 'asc' }, // In case of position conflicts
        ],
        skip,
        take: limit, // Limit the results to the number of items per page
      });

    const totalFolders =
      await this.prisma.folder.count({
        where: {
          userId,
          parentId: parentId || null,
        },
      });

    const totalPages = Math.ceil(
      totalFolders / limit,
    );

    return {
      folders,
      currentPage: page,
      totalPages,
      totalFolders,
    };
  }

  async getOtherUserFolders(
    username: string,
    parentId?: number,
    page: number = 1,
    limit: number = 5,
  ) {
    const otherUserId =
      await this.prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true, // Select only the `id` field
        },
      });

    const skip = (page - 1) * limit;

    const folders =
      await this.prisma.folder.findMany({
        where: {
          userId: Number(otherUserId.id),
          parentId: parentId || null,
        },
        orderBy: [
          { position: 'asc' },
          { createAt: 'asc' },
        ],
        skip,
        take: limit,
      });

    const totalFolders =
      await this.prisma.folder.count({
        where: {
          userId: Number(otherUserId.id),
          parentId: parentId || null,
        },
      });

    const totalPages = Math.ceil(
      totalFolders / limit,
    );

    return {
      folders,
      currentPage: page,
      totalPages,
      totalFolders,
    };
  }

  // Get a folder by ID
  async getFolderById(
    userId: number,
    folderId: number,
  ) {
    return this.prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
    });
  }

  // Create a folder
  async createFolder(
    userId: number,
    dto: CreateFolderDto,
    req: Express.Request,
  ) {
    let parentFolder = null;

    // Check if parentId is provided (creating a subfolder)
    if (dto.parentId) {
      parentFolder =
        await this.prisma.folder.findUnique({
          where: { id: dto.parentId, userId }, // Ensure the folder belongs to the same user
        });

      if (!parentFolder) {
        throw new ForbiddenException(
          'Parent folder not found',
        );
      }
    }

    // Create the folder (if parentId is null, it's a root folder)
    const folder =
      await this.prisma.folder.create({
        data: {
          userId,
          title: dto.title,
          position: dto.position,
          parentId: parentFolder
            ? parentFolder.id
            : null, // Ensure parentId is valid
        },
      });

    req.session.allItems.push({
      ...folder,
      type: 'folder',
    });

    req.session.allItems.sort(
      (a, b) =>
        (a.position ?? Infinity) -
          (b.position ?? Infinity) ||
        new Date(a.createAt).getTime() -
          new Date(b.createAt).getTime(),
    );

    return folder;
  }

  // Edit folder by ID
  async editFolderById(
    userId: number,
    folderId: number,
    dto: EditFolderDto,
  ) {
    const folder =
      await this.prisma.folder.findUnique({
        where: {
          id: folderId,
        },
      });

    if (!folder || folder.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    return this.prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        ...dto,
      },
    });
  }

  // Delete a folder by ID
  async deleteFolderById(
    userId: number,
    folderId: number,
    req: Express.Request,
  ) {
    const folder =
      await this.prisma.folder.findUnique({
        where: { id: folderId },
      });

    if (!folder || folder.userId !== userId) {
      throw new ForbiddenException(
        'Access to resource denied',
      );
    }

    // Deleting the folder will automatically delete child folders & links due to `onDelete: Cascade`
    await this.prisma.folder.delete({
      where: { id: folderId },
    });

    // Remove the deleted folder from session.allItems (if it exists)
    if (req.session.allItems) {
      req.session.allItems =
        req.session.allItems.filter(
          (item) => item.id !== folderId,
        );
    }
  }
}
