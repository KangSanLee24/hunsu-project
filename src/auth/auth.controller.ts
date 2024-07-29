import {
  HttpStatus,
  Controller,
  UseGuards,
  Body,
  Query,
  Post,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LogIn } from 'src/decorators/log-in.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

import { User } from 'src/user/entities/user.entity';

import { SignUpDto } from './dtos/sign-up.dto';
import { LogInDto } from './dtos/log-in.dto';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';
import { Token } from 'src/decorators/token.decorator';
import { VerifyEmailDto } from './dtos/verify-email.dto';

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
}
