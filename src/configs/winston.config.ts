import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';

// 윈스턴 변수 선언
const { combine, timestamp, printf } = winston.format;

// 배포/개발 여부에 따라 로그레벨 다르게 설정
const isProduction = process.env['NODE_ENV'] === 'production';

// 프로젝트폴더/logs 에 저장
const logDir = __dirname + '/../../logs';

// 윈스턴 데일리 옵션 (파일 저장 옵션)
const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD-HH-mm',
    dirname: logDir,
    filename: `%DATE%.log`,
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: 168,
    // maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.json()
    ),
  };
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    // new winston.transports.Console({
    //   level: isProduction ? 'info' : 'silly',
    //   format: isProduction
    //     ? winston.format.combine(
    //         winston.format.timestamp(),
    //         winston.format.json()
    //       )
    //     : winston.format.combine(
    //         winston.format.timestamp(),
    //         winston.format.json(),
    //         nestWinstonModuleUtilities.format.nestLike('MyApp', {
    //           colors: true,
    //           prettyPrint: true,
    //         })
    //       ),
    // }),
    new winstonDaily(dailyOptions('info')),
    new winstonDaily(dailyOptions('warn')),
    new winstonDaily(dailyOptions('error')),
  ],
});
