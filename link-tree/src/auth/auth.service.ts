import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, SignInDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    //generate the password hash
    const hash = await argon.hash(dto.password);

    //save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          username: dto.username,
        },
      });

      //return the saved user
      return this.signToken(user.id, user.email, user.username);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials Taken',
          );
        }
      }
      throw error;
    }
  }

  async signin(dto: SignInDto) {
    //find user by email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email, // Querying by user id
        },
      });

    //if user doews not exist throw exception
    if (!user)
      throw new ForbiddenException(
        'Credentials Incorrrect',
      );

    //compare password
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );

    //if password incorrect throw exception
    if (!pwMatches)
      throw new ForbiddenException(
        'Credentials Incorrrect',
      );

    //send back the user
    return this.signToken(user.id, user.email, user.username);
  }

  async signToken(
    userId: number,
    email: string,
    username:string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      username,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: secret,
      },
    );

    return {
      access_token: token,
    };
  }
}