import { PartialType } from '@nestjs/swagger';
import { CreateRecommentDto } from './create-recomment.dto';

export class UpdateRecommentDto extends PartialType(CreateRecommentDto) {}
