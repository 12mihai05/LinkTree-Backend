import {
  Controller,
  Get,
  UseGuards,
  Req,
  ParseIntPipe,
  Param,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { ItemsService } from './items.service';
import { GetUser } from '../auth/decorator';
import { UpdatePosDto } from './dto/edit-position.dto';

@UseGuards(JwtGuard)
@Controller('items')
export class ItemsController {
  constructor(
    private ItemsService: ItemsService,
  ) {}

  // Get all items for the user
  @Get()
  getItems(
    @GetUser('id') userId: number,
    @Req() req: Express.Request,
  ) {
    return this.ItemsService.getItems(
      userId,
      req,
    );
  }

  // Go to the next page of items for the user
  @Get('next')
  async goToNextPage(
    @GetUser('id') userId: number,
    @Req() req: Express.Request,
  ) {
    const currentPage = req.session.currentPage || 1;
    const nextPage = currentPage + 1;

    const { items, isFirstPage } = await this.ItemsService.getItems(
      userId,
      req,
      nextPage,
    );

    if (items.length === 0) {
      req.session.currentPage = currentPage;
      return {
        message: 'No more items available',
        currentPage: currentPage,
        isFirstPage,
        isLastPage: true,
      };
    }

    req.session.currentPage = nextPage;
    const isLastPage = items.length < 5; // Less than 5 items means it's the last page

    return {
      items,
      currentPage: nextPage,
      isFirstPage,
      isLastPage,
    };
  }

  // Go to the next page of items for another user
  @Get(':username/next')
  async goToOtherUsersNextPage(
    @Param('username') username: string,
    @Req() req: Express.Request,
  ) {
    const currentPage = req.session.otherUserCurrentPage || 1;
    const nextPage = currentPage + 1;

    const { items, isFirstPage } = await this.ItemsService.getOtherUserItems(
      username,
      req,
      nextPage,
    );

    if (items.length === 0) {
      req.session.otherUserCurrentPage = currentPage;
      return {
        message: 'No more items available',
        currentPage: currentPage,
        isFirstPage,
        isLastPage: true,
      };
    }

    req.session.otherUserCurrentPage = nextPage;
    const isLastPage = items.length < 5;

    return {
      items,
      currentPage: nextPage,
      isFirstPage,
      isLastPage,
    };
  }

  // Go to the previous page of items for the user
  @Get('previous')
  async goToPreviousPage(
    @GetUser('id') userId: number,
    @Req() req: Express.Request,
  ) {
    const currentPage = req.session.currentPage || 1;
    if (currentPage === 1) {
      return { message: 'Already on the first page' };
    }

    const prevPage = currentPage - 1;
    const { items, isFirstPage } = await this.ItemsService.getItems(
      userId,
      req,
      prevPage,
    );

    req.session.currentPage = prevPage;
    return {
      items,
      currentPage: prevPage,
      isFirstPage,
      isLastPage: false, // Not the last page when going backwards
    };
  }

  // Go to the previous page of items for another user
  @Get(':username/previous')
  async goToOtherUsersPreviousPage(
    @Param('username') username: string,
    @Req() req: Express.Request,
  ) {
    const currentPage = req.session.otherUserCurrentPage || 1;
    if (currentPage === 1) {
      return { message: 'Already on the first page' };
    }

    const prevPage = currentPage - 1;
    const { items, isFirstPage } = await this.ItemsService.getOtherUserItems(
      username,
      req,
      prevPage,
    );

    req.session.otherUserCurrentPage = prevPage;
    return {
      items,
      currentPage: prevPage,
      isFirstPage,
      isLastPage: false,
    };
  }

  // Get items from a specific folder for the user
  @Get('folder/:folderId')
  getItemsFromFolder(
    @GetUser('id') userId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
  ) {
    return this.ItemsService.getItemsFromFolder(userId, folderId);
  }

  // Get items of another user
  @Get(':username')
  getOtherUserItems(
    @Param('username') username: string,
    @Req() req: Express.Request,
    @Query('page') page: number = 1,
  ) {
    return this.ItemsService.getOtherUserItems(username, req, page);
  }

  // Get items from a folder for another user
  @Get(':username/folder/:folderId')
  getOtherUserItemsFromFolders(
    @Param('username') username: string,
    @Query('folderId', ParseIntPipe) folderId: number,
  ) {
    return this.ItemsService.getOtherUserItemsFromFolders(username, folderId);
  }

  // Update positions of items
  @Patch('positions')
  async updatePos(
    @GetUser('id') userId: number,
    @Body() links: UpdatePosDto[],
    @Req() req: Express.Request,
  ) {
    return this.ItemsService.updatePos(userId, links, req);
  }

  // Move an item to another folder
  @Patch(':id/move-folder')
  moveItemToAnotherFolder(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) itemId: number,
    @Body() { folderId, type }: { folderId: number; type: 'link' | 'folder' },
  ) {
    return this.ItemsService.moveItemToAnotherFolder(
      userId,
      itemId,
      folderId,
      type,
    );
  }
}
