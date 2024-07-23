import { Injectable } from '@nestjs/common';
import { CreateRecommentDto } from './dtos/create-recomment.dto';
import { UpdateRecommentDto } from './dtos/update-recomment.dto';

@Injectable()
export class RecommentService {
  create(createRecommentDto: CreateRecommentDto) {
    return 'This action adds a new recomment';
  }

  findAll() {
    return `This action returns all recomment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recomment`;
  }

  update(id: number, updateRecommentDto: UpdateRecommentDto) {
    return `This action updates a #${id} recomment`;
  }

  remove(id: number) {
    return `This action removes a #${id} recomment`;
  }
}
