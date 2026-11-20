import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) { }

  @Get()
  async getAllItems(
    @Query('page') page = '1',
    @Query('per_page') perPage = '20',
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('full') full?: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPageNum = Math.min(100, Math.max(1, parseInt(perPage, 10) || 20));
    const startDate = this.parseDate(start, 'start');
    const endDate = this.parseDate(end, 'end');
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('start must be before or equal to end');
    }

    const [items, total] = await this.itemService.findAll(
      pageNum,
      perPageNum,
      startDate,
      endDate,
      full === 'true' || full === '1',
    );
    res.setHeader('X-Total-Count', String(total));
    return items;
  }

  private parseDate(value: string | undefined, name: string): Date | undefined {
    if (!value) {
      return undefined;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${name} must be a valid date`);
    }
    return date;
  }

  @Get(':id')
  async getItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemService.findOne(id);
  }

  @Post()
  async createItem(@Body() jsonItem: Record<string, unknown>) {
    console.log('POST request received:', jsonItem);
    return this.itemService.create(jsonItem);
  }
}
