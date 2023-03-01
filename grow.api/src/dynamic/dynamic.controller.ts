import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { DynamicItemsResponse } from './dto/dynamic-items-response.dto';
import { DynamicService } from './dynamic.service';

@Controller('dynamic')
export class DynamicController {
  constructor(private readonly dynamicService: DynamicService) {}

  @Get(':itemKey')
  async findOne(@Param('itemKey') itemKey: string) {
    const allItems: DynamicItemsResponse = { [itemKey]: [] };

    const dynamicItems = await this.dynamicService.findManyByItemKey(itemKey)
    allItems[itemKey] = dynamicItems

    return allItems;
  }
}
