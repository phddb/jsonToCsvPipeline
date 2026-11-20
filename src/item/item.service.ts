import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) { }

  async findAll(
    page: number,
    perPage: number,
    start?: Date,
    end?: Date,
    includeItems = false,
  ): Promise<[Array<Item | string>, number]> {
    const where = this.createdAtRange(start, end);
    const [items, total] = await this.itemRepository.findAndCount({
      // createdAt must be selected so the ORDER BY column survives TypeORM's pagination query.
      select: includeItems ? undefined : { id: true, createdAt: true },
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    if (!includeItems) {
      return [items.map((item) => item.id), total];
    }
    return [items, total];
  }

  private createdAtRange(start?: Date, end?: Date): FindOptionsWhere<Item> | undefined {
    if (start && end) {
      return { createdAt: Between(start, end) };
    }
    if (start) {
      return { createdAt: MoreThanOrEqual(start) };
    }
    if (end) {
      return { createdAt: LessThanOrEqual(end) };
    }
    return undefined;
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }

  async create(jsonItem: Record<string, unknown>): Promise<Item> {
    const item = this.itemRepository.create({ jsonItem });
    return this.itemRepository.save(item);
  }
}
