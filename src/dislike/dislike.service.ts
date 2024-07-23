import { Injectable } from '@nestjs/common';
import { CreateDislikeDto } from './dtos/create-dislike.dto';
import { UpdateDislikeDto } from './dtos/update-dislike.dto';

@Injectable()
export class DislikeService {
  create(createDislikeDto: CreateDislikeDto) {
    return 'This action adds a new dislike';
  }

  findAll() {
    return `This action returns all dislike`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dislike`;
  }

  update(id: number, updateDislikeDto: UpdateDislikeDto) {
    return `This action updates a #${id} dislike`;
  }

  remove(id: number) {
    return `This action removes a #${id} dislike`;
  }
}
