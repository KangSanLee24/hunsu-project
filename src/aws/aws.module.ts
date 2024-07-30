// aws s3이용 이미지 저장
import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
