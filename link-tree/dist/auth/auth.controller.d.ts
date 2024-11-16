import { AuthService } from './auth.service';
import { AuthDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
