import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecommentService } from './recomment.service';
import { CreateRecommentDto } from './dtos/create-recomment.dto';
import { UpdateRecommentDto } from './dtos/update-recomment.dto';

@Controller('recomment')
export class RecommentController {
  constructor(private readonly recommentService: RecommentService) {}

  @Post()
  create(@Body() createRecommentDto: CreateRecommentDto) {
    return this.recommentService.create(createRecommentDto);
  }

  @Get()
  findAll() {
    return this.recommentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recommentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecommentDto: UpdateRecommentDto) {
    return this.recommentService.update(+id, updateRecommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recommentService.remove(+id);
  }
}
