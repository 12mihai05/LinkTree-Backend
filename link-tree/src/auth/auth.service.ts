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
import * as dotenv from 'dotenv';
import { sortItemsByPositionAndDate } from '../utils/sortItems';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Handle user registration
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password); // Hash the password
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          username: dto.username,
        },
      });
      return this.signToken(user.id, user.email, user.username); // Return JWT token
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('Credentials Taken'); // Handle duplicate credentials
      }
      throw error;
    }
  }

  // Handle user sign-in
  async signin(dto: SignInDto, req: Express.Request) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new ForbiddenException('Credentials Incorrect'); // User not found

    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) throw new ForbiddenException('Credentials Incorrect'); // Invalid password

    // Fetch links and folders
    const links = await this.prisma.link.findMany({
      where: { userId: user.id, folderId: null },
      orderBy: [{ position: 'asc' }, { createAt: 'asc' }],
    });

    const folders = await this.prisma.folder.findMany({
      where: { userId: user.id, parentId: null },
      orderBy: [{ position: 'asc' }, { createAt: 'asc' }],
    });

    // Combine and sort links and folders
    const allItems = [...links, ...folders];
    const sortedItems = sortItemsByPositionAndDate(allItems);

    // Store sorted items in session
    req.session.allItems = sortedItems;

    return this.signToken(user.id, user.email, user.username); // Return JWT token
  }

  // Generate JWT token
  async signToken(userId: number, email: string, username: string): Promise<{ access_token: string }> {
    dotenv.config();
    const sessionDuration = this.config.get('SESSION_DURATION');
    const payload = { sub: userId, email, username };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: sessionDuration / 1000,
      secret: secret,
    });

    return { access_token: token };
  }
}
