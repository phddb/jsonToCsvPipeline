import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) { }

  async findAll(page: number, perPage: number): Promise<[Item[], number]> {
    return this.itemRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
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
