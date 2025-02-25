import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignInDto } from './dto';
import { GetUser } from './decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: SignInDto,
    @Req() request: Express.Request,
  ) {
    return this.authService.signin(dto, request);
  }

  @Patch('change-password')
  async changePassword(
  @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(dto);
  }
}
