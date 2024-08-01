// aws.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    // AWS S3 클라이언트 초기화. 환경 설정 정보를 사용하여 AWS 리전, Access Key, Secret Key를 설정.
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'), // AWS Region
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'), // Access Key
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'), // Secret Key
      },
    });
  }

  // 첨부파일, 이미지 업로드
  async imageUploadToS3(
    fileName: string, // 업로드될 파일의 이름
    folder: string, // 업로드될 폴더 이름
    file: Express.Multer.File, // 업로드할 파일
    ext: string // 파일 확장자
  ) {
    const key = `${folder}/${fileName}.${ext}`;
    // AWS S3에 이미지 업로드 명령을 생성합니다. 파일 이름, 파일 버퍼, 파일 접근 권한, 파일 타입 등을 설정합니다.
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'), // S3 버킷 이름
      Key: key, // 업로드될 파일의 이름
      Body: file.buffer, // 업로드할 파일
      ACL: 'public-read', // 파일 접근 권한
      ContentType: `image/${ext}`, // 파일 타입
    });
    // 업로드된 이미지의 URL을 생성합니다.
    const fileUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${key}`;

    // 생성된 명령을 S3 클라이언트에 전달하여 이미지 업로드를 수행합니다.
    await this.s3Client.send(command);

    // 업로드된 이미지의 URL을 반환합니다.
    return fileUrl;
  }

  // // 첨부 파일 삭제
  // async deleteFileFromS3(fileUrl: string) {
  //   const fileName = fileUrl.split('/').pop();
  //   const command = new DeleteObjectCommand({
  //     Bucket: this.awsS3Bucket,
  //     Key: fileName,
  //   });
  //   await this.s3Client.send(command);
  // }
}
