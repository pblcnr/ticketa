import {
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../../../generated/prisma/client';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CatalogItem } from '../providers/catalog-provider.interface';
import { CatalogService } from '../services/catalog.service';

@Controller('catalog')
@UseGuards(RolesGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('search')
  @Roles(Role.ORGANIZADOR)
  search(
    @Query('keyword') keyword?: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page?: number,
  ): Promise<CatalogItem[]> {
    return this.catalogService.search(keyword, page);
  }

  @Get(':externalId')
  @Roles(Role.ORGANIZADOR)
  async findById(@Param('externalId') externalId: string): Promise<CatalogItem> {
    const item = await this.catalogService.findById(externalId);

    if (!item) {
      throw new NotFoundException('Item do catálogo não encontrado.');
    }

    return item;
  }
}
