import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { FolderService } from './folder.service';
import { GetUser } from '../auth/decorator';
import {
  CreateFolderDto,
  EditFolderDto,
} from './dto';

@UseGuards(JwtGuard)
@Controller('folders')
export class FolderController {
  constructor(
    private folderService: FolderService,
  ) {}

  // Get all folders for the user, optionally filtering by parentId
  @Get()
  getFolders(
    @GetUser('id') userId: number,
    @Query('parentId') parentId?: number,
  ) {
    return this.folderService.getFolders(
      userId,
      parentId,
    );
  }

  // Get folders of another user by username, optionally filtering by parentId
  @Get(':username')
  getOtherUserFolders(
    @Param('username') username: string,
    @Query('parentId') parentId?: number,
  ) {
    return this.folderService.getOtherUserFolders(
      username,
      parentId,
    );
  }

  // Get a single folder by ID
  @Get(':id')
  getFolderById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) folderId: number,
  ) {
    return this.folderService.getFolderById(
      userId,
      folderId,
    );
  }

  // Create a folder
  @Post()
  createFolder(
    @GetUser('id') userId: number,
    @Body() dto: CreateFolderDto,
    @Req() req: Express.Request,
  ) {
    return this.folderService.createFolder(
      userId,
      dto,
      req,
    );
  }

  // Edit a folder's details, such as title or parentId
  @Patch(':id')
  editFolderById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) folderId: number,
    @Body() dto: EditFolderDto,
  ) {
    return this.folderService.editFolderById(
      userId,
      folderId,
      dto,
    );
  }

  // Delete a folder by ID
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteFolderById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) folderId: number,
    @Req() req: Express.Request,
  ) {
    return this.folderService.deleteFolderById(
      userId,
      folderId,
      req,
    );
  }
}
