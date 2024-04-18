import { Injectable } from '@nestjs/common';
import { CreateRepostDto } from './dto/create-repost.dto';
import { UpdateRepostDto } from './dto/update-repost.dto';

@Injectable()
export class RepostService {
  create(createRepostDto: CreateRepostDto) {
    return 'This action adds a new repost';
  }

  findAll() {
    return `This action returns all repost`;
  }

  findOne(id: number) {
    return `This action returns a #${id} repost`;
  }

  update(id: number, updateRepostDto: UpdateRepostDto) {
    return `This action updates a #${id} repost`;
  }

  remove(id: number) {
    return `This action removes a #${id} repost`;
  }
}
