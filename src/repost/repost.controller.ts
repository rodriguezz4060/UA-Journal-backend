import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RepostService } from './repost.service';
import { CreateRepostDto } from './dto/create-repost.dto';
import { UpdateRepostDto } from './dto/update-repost.dto';

@Controller('repost')
export class RepostController {
  constructor(private readonly repostService: RepostService) {}

  @Post()
  create(@Body() createRepostDto: CreateRepostDto) {
    return this.repostService.create(createRepostDto);
  }

  @Get()
  findAll() {
    return this.repostService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repostService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRepostDto: UpdateRepostDto) {
    return this.repostService.update(+id, updateRepostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repostService.remove(+id);
  }
}
