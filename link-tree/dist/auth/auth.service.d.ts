import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    signup(dto: AuthDto): Promise<{
        email: string;
        id: number;
        createAt: Date;
        updateAt: Date;
        hash: string;
        firstName: string | null;
        lastName: string | null;
    }>;
    signin(dto: AuthDto): Promise<{
        email: string;
        id: number;
        createAt: Date;
        updateAt: Date;
        hash: string;
        firstName: string | null;
        lastName: string | null;
    }>;
}
