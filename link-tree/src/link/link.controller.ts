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
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { LinkService } from './link.service';
import { GetUser } from '../auth/decorator';
import {
  CreateLinkDto,
  EditLinkDto,
} from './dto';
import { UpdatePosDto } from './dto/edit-position.dto';

@UseGuards(JwtGuard)
@Controller('links')
export class LinkController {
  constructor(private linkService: LinkService) {}

  @Get()
  getLinks(@GetUser('id') userId: number) {
    return this.linkService.getLinks(userId);
  }

  @Get(':id')
  getLinkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
  ) {
    return this.linkService.getLinksById(
      userId,
      linkId,
    );
  }

  @Post()
  createLink(
    @GetUser('id') userId: number,
    @Body() dto: CreateLinkDto,
  ) {
    return this.linkService.createLink(
      userId,
      dto,
    );
  }

  @Patch('positions')
  async updatePos(
    @GetUser('id') userId: number,
    @Body() links: UpdatePosDto[], // Expecting an array of links with their new positions
  ) {
    return this.linkService.updatePos(userId, links);
  }

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

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteLinkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
  ) {
    return this.linkService.deleteLinkById(
      userId,
      linkId,
    );
  }
}
