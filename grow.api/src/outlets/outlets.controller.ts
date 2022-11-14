import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { OutletsService } from './outlets.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { OutletCommandDto } from './dto/outlet-command.dto';

@Controller('outlets')
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Post()
  async create(@Body() createOutletDto: CreateOutletDto) {
    return this.outletsService.create(createOutletDto);
  }

  @Get()
  findAll() {
    return this.outletsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.outletsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOutletDto: UpdateOutletDto) {
    return this.outletsService.update(+id, updateOutletDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.outletsService.delete(+id);
  }

  @Post(':id/command')
  async command(@Param('id') id: string, @Body() outletCommandDto: OutletCommandDto) {
    return this.outletsService.command(+id, outletCommandDto);
  }
}
