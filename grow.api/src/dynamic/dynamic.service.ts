import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

import { CreateDynamicItemDto } from './dto/create-dynamic-item.dto';
import { DynamicItem } from './entities/dynamic-item.entity';
import { DynamicAddItem, DynamicItemsAddRequest } from './dto/dynamic-items-add-request.dto';

@Injectable()
export class DynamicService {

  constructor(
    @InjectRepository(DynamicItem)
    private dynamicItemRepository: Repository<DynamicItem>

  ) { }


  async addItems(itemKey: string, items: DynamicAddItem, prefix?: string): Promise<DynamicItem[]> {
    console.log('DynamicService addItems', itemKey, items, prefix)

    const self = this;

    return new Promise<DynamicItem[]>(async (resolve, reject) => {
      
      let addedItems: DynamicItem[] = []
      let itemsToAdd: number = 0;

      const nextId = uuidv4()

      Object.keys(items).map(async nestedItemPrefix => {

        let valueKeyPrefix = nestedItemPrefix

        const itemToAdd = items[valueKeyPrefix]
        itemsToAdd += Object.keys(itemToAdd).length

        let finalItemKey: string;
        let itemPrefix: string;

        if (valueKeyPrefix === 'id') {
          console.log('itemToAdd relatedItem', 'valueKeyPrefix:', valueKeyPrefix)

          itemsToAdd += 1

          let valueKey = `id`; // use a new uuid just for this
          if (prefix !== undefined) {
            valueKey = `${prefix}.${valueKey}`
          }
          const value = nextId

          const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value }

          console.log('handleAddItemsEvent creating item', createDynamicItemDto)
          const dynamicItem = await this.create(createDynamicItemDto)

          addedItems.push(dynamicItem)
           
          finalItemKey = valueKey.split('.').slice(-3)[0]
          itemPrefix = `${finalItemKey}.${nextId}`;
        }
        else {
          finalItemKey = itemKey
          itemPrefix = `${valueKeyPrefix}.${nextId}`;
          if (prefix !== undefined) {
            itemPrefix = `${prefix}.${itemPrefix}`
          }
        }
        
        console.log('itemToAdd', valueKeyPrefix, itemPrefix, itemToAdd)

        Object.keys(itemToAdd).map(async valueKeySuffix => {

          const valueKey = `${itemPrefix}.${valueKeySuffix}`;
          const value = itemToAdd[valueKeySuffix];

          if (typeof value === "string") {

            const createDynamicItemDto: CreateDynamicItemDto = { itemKey: finalItemKey, valueKey, value }

            console.log('handleAddItemsEvent creating item', createDynamicItemDto)
            const dynamicItem = await self.create(createDynamicItemDto)

            addedItems.push(dynamicItem)
          }
          else {
            const nestedItems = await self.addItems(finalItemKey, { [valueKeySuffix]: value }, itemPrefix);
            itemsToAdd += nestedItems.length - 1 // subtract one because we already counted the valueSuffix as one

            addedItems = [
              ...addedItems,
              ...nestedItems
            ]
          }

          console.log('should resolve?', addedItems.length === itemsToAdd, addedItems.length, itemsToAdd)
          if (addedItems.length === itemsToAdd) {
            resolve(addedItems);
          }
        })

      })
      
    })
  }

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

  async saveItems(data: unknown) {
    const self = this; 

    return new Promise((resolve, reject) => {
      const items = {};
      Object.keys(data).forEach(async (itemKey, i, a) => {

        items[itemKey] = [];
        const values = data[itemKey]
        Object.keys(values).forEach(async (valueKey, j, b) => {
          const createDynamicItemDto: CreateDynamicItemDto = { itemKey, valueKey, value: values[valueKey] }
          console.log('creating item', createDynamicItemDto)
          const dynamicItem = await self.create(createDynamicItemDto)
          items[itemKey].push(dynamicItem)
          if (i === a.length -1 && j === b.length -1) {
            resolve(items);
          }
        })
      })
    });
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

  async delete(itemKey: string, valueKey: string): Promise<DeleteResult> {
    return await this.dynamicItemRepository.delete({ itemKey, valueKey });
  }

}
