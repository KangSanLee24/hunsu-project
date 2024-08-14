import {
  HttpStatus,
  Controller,
  UseGuards,
  Req,
  Body,
  Query,
  Post,
  Get,
  Patch,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/user/entities/user.entity';

import { SignUpDto } from './dtos/sign-up.dto';
import { LogInDto } from './dtos/log-in.dto';
import { FindIdDto } from './dtos/find-id.dto';
import { RePasswordDto } from './dtos/re-password.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';

import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

import { LogIn } from 'src/decorators/log-in.decorator';
import { Token } from 'src/decorators/token.decorator';
import { VerifyPasswordDto } from './dtos/verify-password.dto';
import { LogInKakao } from 'src/decorators/log-in-kakao.decorator';

@ApiTags('01. AUTH API')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService
  ) {}

  /** 1. 회원 가입(sign-up) API **/
  @ApiOperation({ summary: '1. 회원 가입(sign-up) API' })
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    const data = await this.authService.signUp(signUpDto);
    return {
      status: HttpStatus.CREATED,
      message: AUTH_MESSAGES.SIGN_UP.SUCCESS,
      data: data,
    };
  }

  /** 2. 로그인(log-in) API **/
  @ApiOperation({ summary: '2. 로그인(log-in) API' })
  @Post('log-in')
  async logIn(@Body() logInDto: LogInDto) {
    const data = await this.authService.logIn(logInDto);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.LOG_IN.SUCCESS,
      data: data,
    };
  }

  /** 3. 로그아웃(log-out) API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '3. 로그아웃(log-out) API' })
  @Get('log-out')
  async logOut(@LogIn() user: User) {
    const data = await this.authService.logOut(user);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.LOG_OUT.SUCCESS,
      data: data,
    };
  }

  /** 4. 토큰 재발급 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '4. 토큰 재발급 API' })
  @Post('re-token')
  async reToken(@LogIn() user: User, @Token() refreshToken: string) {
    const data = await this.authService.reToken(user, refreshToken);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.RE_TOKEN.SUCCESS,
      data: data,
    };
  }

  /** 5. 이메일 인증 API **/
  @ApiOperation({ summary: '5. 이메일 인증 API' })
  @Patch('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const data = await this.authService.verifyEmail(verifyEmailDto);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.VERIFY_EMAIL.SUCCESS,
      data: data,
    };
  }

  /** 6. 소셜로그인 **/
  /** 6-1-1. 소셜로그인 - 네이버 **/
  @ApiOperation({ summary: '6-1A. 로그인(log-in) Naver API' })
  @UseGuards(AuthGuard('naver'))
  @Get('log-in/naver')
  async logInNaver() {
    // 네이버 로그인 페이지 접속
  }
  /** 6-1-2. 소셜로그인 - 네이버 콜백 **/
  @ApiOperation({ summary: '6-1B. 로그인(log-in) Naver 콜백 API' })
  @UseGuards(AuthGuard('naver'))
  @Get('log-in/naver/cb')
  async logInNaverCB(@Req() req: any, @Res() res: any) {
    const data = await this.authService.logInNaver(req);
    const { id, certification } = data;
    // 유저id와 인증번호4자리를 아래 주소로 전달하며 리다이렉트
    const url = this.configService.get<string>('NAVER_REDIRECT_URL');
    res.redirect(`${url}?id=${id}&certification=${certification}`);
  }
  /** 6-1-3. 소셜로그인 - 네이버 리콜 **/
  @Get('log-in/naver/rc')
  async logInNaverRC(
    @Query('userId') userId: number,
    @Query('certification') certification: number
  ) {
    const data = await this.authService.logInNaverRC(userId, certification);
    return {
      status: HttpStatus.OK,
      message: '네이버 로그인에 성공하셨습니다.',
      data: data,
    };
  }

  /** 6-2-1. 소셜로그인 - 구글 **/
  @ApiOperation({ summary: '6-2A. 로그인(log-in) Google API' })
  @Get('log-in/google')
  async logInGoogle() {}
  /** 6-2-2. 소셜로그인 - 구글 콜백 **/
  @ApiOperation({ summary: '6-2B. 로그인(log-in) Google 콜백 API' })
  @Get('log-in/google/cb')
  async logInGoogleCB() {}

  /** 6-2. 소셜로그인 - 카카오 **/
  // @UseGuards(AuthGuard('kakao'))
  // @Get('log-in/kakao')
  // async logInKakao(@LogInKakao() kakaoData) {
  //   const { kakao, tokens } = kakaoData;
  //   const { accessToken, refreshToken } = await this.authService.getJWT(
  //     kakao.user.kakaoId
  //   );
  //   tokens.cookie('accessToken', accessToken, { httpOnly: true });
  //   tokens.cookie('refreshToken', refreshToken, { httpOnly: true });
  //   tokens.cookie('isLoggedIn', true, { httpOnly: false });
  //   return tokens.redirect(this.configService.get('KAKAO_CLIENT_URL'));
  // }

  /** 7. 비밀번호 변경 요청 API **/
  @ApiOperation({ summary: '6. 비밀번호 변경 요청 API' })
  @Post('re-password')
  async rePassword(@Body() rePasswordDto: RePasswordDto) {
    const data = await this.authService.rePassword(rePasswordDto);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.RE_PASSWORD.SUCCESS,
    };
  }

  /** 8. 비밀번호 변경 인증 API **/
  @ApiOperation({ summary: '7. 비밀번호 변경 인증 API' })
  @Patch('verify-password')
  async verifyPassword(@Body() verifyPasswordDto: VerifyPasswordDto) {
    const data = await this.authService.verifyPassword(verifyPasswordDto);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.VERIFY_PASSWORD.SUCCESS,
      data: data,
    };
  }

  /** 9. 비밀번호 변경 API **/
  @ApiOperation({ summary: '8. 비밀번호 변경 API' })
  @Post('update-password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    const data = await this.authService.updatePassword(updatePasswordDto);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.UPDATE_PASSWORD.SUCCESS,
      data: data,
    };
  }

  /** 10. 아이디 찾기 API **/
  @ApiOperation({ summary: '9. 아이디 찾기 API' })
  @Get('find-id')
  async findId(@Query() findIdDto: FindIdDto) {
    const data = await this.authService.findId(findIdDto);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.FIND_ID.SUCCESS,
      data: data,
    };
  }
}
