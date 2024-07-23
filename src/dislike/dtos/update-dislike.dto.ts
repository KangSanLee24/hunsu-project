import { PartialType } from '@nestjs/swagger';
import { CreateDislikeDto } from './create-dislike.dto';

export class UpdateDislikeDto extends PartialType(CreateDislikeDto) {}
