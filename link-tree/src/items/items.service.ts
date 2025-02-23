import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePosDto } from './dto/edit-position.dto';
import { Folder, Link } from '@prisma/client';
import { sortItemsByPositionAndDate } from '../utils/sortItems';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  // Fetches the items (links and folders) for the user, paginated
  async getItems(userId: number, req: Express.Request, page: number = 1) {
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    // Fetch links and folders for the user with pagination
    const links = await this.prisma.link.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });

    const folders = await this.prisma.folder.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });

    // Combine links and folders, then sort them by position and date using the utility function
    const allItems = [...links, ...folders];
    const sortedItems = sortItemsByPositionAndDate(allItems);

    // Return paginated results
    const first5Items = sortedItems.slice(0, 5);

    // Store items and page number in session for later use
    req.session.allItems = sortedItems;
    req.session.currentPage = page;

    return {
      items: first5Items,
      currentPage: page,
      isFirstPage: req.session.currentPage === 1,
      isLastPage: allItems.length < pageSize, // Determine if this is the last page
    };
  }

  // Fetches items within a specific folder
  async getItemsFromFolder(userId: number, folderId: number) {
    // Check if the folder exists for the user
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) throw new NotFoundException('Folder not found');

    // Get links within the folder and all folders for the user
    const links = await this.prisma.link.findMany({
      where: { folderId: folder.id, userId },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });

    const folders = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });

    // Combine links and folders, then sort
    const allItems = [...links, ...folders];
    const sortedItems = sortItemsByPositionAndDate(allItems);

    return sortedItems;
  }

  // Fetches items for another user, paginated
  async getOtherUserItems(username: string, req: Express.Request, page: number = 1) {
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    // Retrieve the userId based on the username
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const userId = user.id;

    // Fetch links and folders for the user with pagination
    const links = await this.prisma.link.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });

    const folders = await this.prisma.folder.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });

    // Combine items, sort, and return paginated data
    const allItems = [...links, ...folders];
    const sortedItems = sortItemsByPositionAndDate(allItems);

    const first5Items = sortedItems.slice(0, 5);

    // Store the other user's items in session
    req.session.otherUserItems = sortedItems;
    req.session.otherUserCurrentPage = page;

    return {
      items: first5Items,
      currentPage: page,
      isFirstPage: page === 1,
      isLastPage: allItems.length < pageSize,
    };
  }

  async getOtherUserItemsFromFolders(
    username: string,
    folderId: number,
  ) {
    // Retrieve the userId based on the username
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const userId = user.id;
  
    // Check if the folder exists for the user
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });
  
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
  
    // Fetch links and subfolders inside the specified folder
    const links = await this.prisma.link.findMany({
      where: { folderId: folder.id, userId },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });
  
    const subfolders = await this.prisma.folder.findMany({
      where: { parentId: folderId, userId },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });
  
    // Combine links and subfolders
    const allItems = [...links, ...subfolders];
  
    // Sort items by position and creation date
    const sortedItems = sortItemsByPositionAndDate(allItems);
  
    return sortedItems;
  }
  
  async updatePos(
    userId: number,
    items: UpdatePosDto[],
    req: Express.Request,
  ) {
    if (!Array.isArray(items)) {
      throw new ForbiddenException('Items position should be an array');
    }
  
    // Separate folders and links
    const folders = items.filter(item => item.type === 'folder');
    const links = items.filter(item => item.type === 'link');
  
    // Extract IDs
    const folderIds = folders.map(folder => folder.id);
    const linkIds = links.map(link => link.id);
  
    // Fetch user's folders and links from DB
    const userFolders = await this.prisma.folder.findMany({
      where: { userId, id: { in: folderIds } },
    });
  
    const userLinks = await this.prisma.link.findMany({
      where: { userId, id: { in: linkIds } },
    });
  
    // Validate ownership
    if (userFolders.length !== folders.length || userLinks.length !== links.length) {
      throw new ForbiddenException('Some items do not belong to the user');
    }
  
    // Prepare update promises
    const folderUpdates = folders.map(folder =>
      this.prisma.folder.update({
        where: { id: folder.id },
        data: { position: folder.position },
      }),
    );
  
    const linkUpdates = links.map(link =>
      this.prisma.link.update({
        where: { id: link.id },
        data: { position: link.position },
      }),
    );
  
    // Execute all updates in a transaction
    await this.prisma.$transaction([...folderUpdates, ...linkUpdates]);
  
    // Fetch updated items
    const updatedFolders = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });
  
    const updatedLinks = await this.prisma.link.findMany({
      where: { userId },
      orderBy: [
        { position: 'asc' },
        { createAt: 'asc' },
      ],
    });
  
    // Combine and sort the items
    const allItems = [...updatedLinks, ...updatedFolders];
    const sortedItems = sortItemsByPositionAndDate(allItems);

  
    req.session.allItems = sortedItems;
    console.log('Updated session.allItems:', req.session.allItems);
  
    return sortedItems;
  }
  
  async moveItemToAnotherFolder(
    userId: number,
    itemId: number,
    folderId: number | null,
    type: 'link' | 'folder',
  ) {
    let item;
  
    // Fetch the item based on its type
    if (type === 'link') {
      item = await this.prisma.link.findUnique({
        where: { id: itemId },
      });
    } else if (type === 'folder') {
      item = await this.prisma.folder.findUnique({
        where: { id: itemId },
      });
    }
  
    // Ensure item exists and belongs to the user
    if (!item || item.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
  
    // Check if the item is already in the target folder
    if (item.folderId === folderId) {
      throw new ForbiddenException('Item is already in the target folder');
    }
  
    // If folderId is provided, check if the target folder exists and belongs to the user
    if (folderId !== null) {
      const targetFolder = await this.prisma.folder.findUnique({
        where: { id: folderId },
      });
  
      if (!targetFolder || targetFolder.userId !== userId) {
        throw new ForbiddenException('Folder not found or not owned by user');
      }
    }
  
    // Move the item by updating its folderId and resetting its position
    if (type === 'link') {
      await this.prisma.link.update({
        where: { id: itemId },
        data: {
          folderId,
          position: null, // Reset position after moving
        },
      });
    } else if (type === 'folder') {
      await this.prisma.folder.update({
        where: { id: itemId },
        data: {
          parentId: folderId,
          position: null, // Reset position after moving
        },
      });
    }
  
    return { message: 'Item moved successfully' };
  }
  
}  