import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DislikeService } from './dislike.service';
import { CreateDislikeDto } from './dtos/create-dislike.dto';
import { UpdateDislikeDto } from './dtos/update-dislike.dto';

@Controller('dislike')
export class DislikeController {
  constructor(private readonly dislikeService: DislikeService) {}

  @Post()
  create(@Body() createDislikeDto: CreateDislikeDto) {
    return this.dislikeService.create(createDislikeDto);
  }

  @Get()
  findAll() {
    return this.dislikeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dislikeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDislikeDto: UpdateDislikeDto) {
    return this.dislikeService.update(+id, updateDislikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dislikeService.remove(+id);
  }
}
