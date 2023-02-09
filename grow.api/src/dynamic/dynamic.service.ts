import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CreateDynamicItemDto } from './dto/create-dynamic-item.dto';
import { DynamicItem } from './entities/dynamic-item.entity';

@Injectable()
export class DynamicService {

  constructor(
    @InjectRepository(DynamicItem)
    private dynamicItemRepository: Repository<DynamicItem>

  ) { }

  async create(createDynamicItemDto: CreateDynamicItemDto): Promise<DynamicItem> {
    const newDynamicItem = plainToClass(DynamicItem, createDynamicItemDto);
    // console.log(createDynamicItemDto, newDynamicItem)
    var existingItem = await this.dynamicItemRepository.findOneBy({ itemKey: newDynamicItem.itemKey, valueKey: newDynamicItem.valueKey });
    if (existingItem) {
      // console.log(existingItem)
      await this.dynamicItemRepository.update(existingItem.id, newDynamicItem);
      return { ...existingItem, ...newDynamicItem };
    }

    var dynamicItem = await this.dynamicItemRepository.save(newDynamicItem);
    return dynamicItem;
  }

  async findAll(): Promise<DynamicItem[]> {
    return await this.dynamicItemRepository.find();
  }

  async findManyByItemKey(itemKey: string): Promise<DynamicItem[]> {
    return await this.dynamicItemRepository.findBy({ itemKey });
  }

  async findOne(id: number): Promise<DynamicItem> {
    return await this.dynamicItemRepository.findOneBy({ id });
  }
}
