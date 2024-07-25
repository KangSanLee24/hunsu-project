import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SignUpDto } from './dtos/sign-up.dto';
import { LogInDto } from './dtos/log-in.dto';

import { AuthService } from './auth.service';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

@ApiTags('1. AUTH API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      messgae: AUTH_MESSAGES.LOG_IN.SUCCESS,
      data: data,
    };
  }
}
