import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { PumpsService } from './pumps.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';

@Controller('pumps')
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Post()
  create(@Body() createPumpDto: CreatePumpDto) {
    return this.pumpsService.create(createPumpDto);
  }

  @Get()
  findAll() {
    return this.pumpsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pumpsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePumpDto: UpdatePumpDto) {
    return this.pumpsService.update(+id, updatePumpDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pumpsService.remove(+id);
  }
}
