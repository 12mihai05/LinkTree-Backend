import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, SignInDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    signup(dto: AuthDto): Promise<{
        access_token: string;
    }>;
    signin(dto: SignInDto, req: Express.Request): Promise<{
        access_token: string;
    }>;
    signToken(userId: number, email: string, username: string): Promise<{
        access_token: string;
    }>;
    changePassword(dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
