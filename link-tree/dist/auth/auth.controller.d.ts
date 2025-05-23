import { AuthService } from './auth.service';
import { AuthDto, SignInDto } from './dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(dto: AuthDto): Promise<{
        access_token: string;
    }>;
    signin(dto: SignInDto, request: Express.Request): Promise<{
        access_token: string;
    }>;
    changePassword(dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
