import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dtos/create-like.dto';
import { UpdateLikeDto } from './dtos/update-like.dto';

@Injectable()
export class LikeService {
  create(createLikeDto: CreateLikeDto) {
    return 'This action adds a new like';
  }

  findAll() {
    return `This action returns all like`;
  }

  findOne(id: number) {
    return `This action returns a #${id} like`;
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  remove(id: number) {
    return `This action removes a #${id} like`;
  }
}
