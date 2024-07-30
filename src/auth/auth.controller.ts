import { Controller, Patch, Post, Body, HttpStatus, Get, UseGuards, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SignUpDto } from './dtos/sign-up.dto';
import { LogInDto } from './dtos/log-in.dto';
import { FindIdDto } from './dtos/find-id.dto';
// import { RePasswordDto } from './dtos/re-password.dto';

import { AuthService } from './auth.service';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { LogIn } from 'src/decorators/log-in.decorator';
import { Token } from 'src/decorators/token.decorator';
import { VerifyEmailDto } from './dtos/verify-email.dto';

@ApiTags('1. AUTH API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
  @Delete('log-out')
  async logOut(@LogIn() user: User) {
    const data = await this.authService.logOut(user);
    return {
      status: HttpStatus.OK,
      message: AUTH_MESSAGES.LOG_OUT.SUCCESS,
      data: data,
    };
  }

  /** 4. 토큰 재발급 API **/
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

  // /** 6. 비밀번호 바꾸기 API **/
  // @ApiOperation({ summary: '비밀번호 바꾸기 API' })
  // @Patch('re-password')
  // async rePassword(
  //   @Body() rePasswordDto: RePasswordDto
  // ) {
  //   const data = await this.authService.rePassword(rePasswordDto);
  //   return {
  //     status: HttpStatus.OK,
  //     // message: AUTH_MESSAGES.UPDATE_ME.SUCCESS,
  //     message: "비밀번호 바꾸기를 성공하셨습니다.",
  //   };
  // }

  /** 7. 아이디 찾기 API **/
  @ApiOperation({ summary: '아이디 찾기 API' })
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