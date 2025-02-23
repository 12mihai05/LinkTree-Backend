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
import { LinkService } from './link.service';
import { GetUser } from '../auth/decorator';
import {
  CreateLinkDto,
  EditLinkDto,
} from './dto';

@UseGuards(JwtGuard) // Protect routes with JwtGuard to ensure only authenticated users can access
@Controller('links')
export class LinkController {
  constructor(private linkService: LinkService) {}

  // Get all links for the authenticated user, optionally filtered by folderId
  @Get()
  getLinks(
    @GetUser('id') userId: number,
    @Query('folderId') folderId?: number,
  ) {
    return this.linkService.getLinks(
      userId,
      folderId,
    );
  }

  // Get links for another user by their username, optionally filtered by folderId
  @Get(':username')
  getOtherUserLinks(
    @Param('username') username: string,
    @Query('folderId') folderId?: number,
  ) {
    return this.linkService.getOtherUserLinks(
      username,
      folderId,
    );
  }

  // Get links from a specific folder
  @Get('folder/:folderId')
  getLinksFromFolder(
    @GetUser('id') userId: number,
    @Param('folderId', ParseIntPipe)
    folderId: number,
  ) {
    return this.linkService.getLinksFromFolder(
      userId,
      folderId,
    );
  }

  // Get a specific link by its ID
  @Get('link/:id')
  getLinkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
  ) {
    return this.linkService.getLinkById(
      userId,
      linkId,
    );
  }

  // Create a new link for the authenticated user
  @Post()
  createLink(
    @GetUser('id') userId: number,
    @Body() dto: CreateLinkDto,
    @Req() req: Express.Request,
  ) {
    return this.linkService.createLink(
      userId,
      dto,
      req,
    );
  }

  // Edit an existing link by its ID
  @Patch(':id')
  editLinkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
    @Body() dto: EditLinkDto,
  ) {
    return this.linkService.editLinkById(
      userId,
      linkId,
      dto,
    );
  }

  // Delete a specific link by its ID
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteLinkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
    @Req() req: Express.Request,
  ) {
    return this.linkService.deleteLinkById(
      userId,
      linkId,
      req,
    );
  }

  // Move a link to another folder
  @Patch(':id/move-folder')
  moveLinkToAnotherFolder(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
    @Body() { folderId }: { folderId: number },
  ) {
    return this.linkService.moveLinkToAnotherFolder(
      userId,
      linkId,
      folderId,
    );
  }
}
