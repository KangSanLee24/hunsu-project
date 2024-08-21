import { Type } from 'class-transformer';
import {
  IsDate,
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  IsNumber,
} from 'class-validator';
import {
  LogContextType,
  LogLevelType,
  LogMethodType,
  LogStatusCodeType,
} from '../types/log.type';

export class GetAllLogsDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page: number = 1; // 기본값: 페이지 1

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit: number = 20; // 기본값: 한 페이지에 20개의 로그

  @IsOptional()
  @IsEnum(LogContextType)
  contextType: LogContextType;

  @IsOptional()
  @IsEnum(LogLevelType)
  levelType: LogLevelType;

  @IsOptional()
  @IsEnum(LogStatusCodeType)
  statusCodeType: LogStatusCodeType;

  @IsOptional()
  @IsEnum(LogMethodType)
  methodType: LogMethodType;

  @IsOptional()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsDate()
  time: Date;
}
