"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const argon = require("argon2");
const library_1 = require("@prisma/client/runtime/library");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const dotenv = require("dotenv");
const sortItems_1 = require("../utils/sortItems");
const emailValidator = require("email-validator");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async signup(dto) {
        const hash = await argon.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                    username: dto.username,
                },
            });
            return this.signToken(user.id, user.email, user.username);
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.ForbiddenException('Credentials Taken');
            }
            throw error;
        }
    }
    async signin(dto, req) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.ForbiddenException('Credentials Incorrect');
        const pwMatches = await argon.verify(user.hash, dto.password);
        if (!pwMatches)
            throw new common_1.ForbiddenException('Credentials Incorrect');
        const links = await this.prisma.link.findMany({
            where: { userId: user.id, folderId: null },
            orderBy: [{ position: 'asc' }, { createAt: 'asc' }],
        });
        const folders = await this.prisma.folder.findMany({
            where: { userId: user.id, parentId: null },
            orderBy: [{ position: 'asc' }, { createAt: 'asc' }],
        });
        const allItems = [...links, ...folders];
        const sortedItems = (0, sortItems_1.sortItemsByPositionAndDate)(allItems);
        req.session.allItems = sortedItems;
        return this.signToken(user.id, user.email, user.username);
    }
    async signToken(userId, email, username) {
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
    async changePassword(dto) {
        let user;
        if (emailValidator.validate(dto.identifier)) {
            user = await this.prisma.user.findUnique({
                where: { email: dto.identifier },
            });
        }
        else {
            user = await this.prisma.user.findUnique({
                where: { username: dto.identifier },
            });
        }
        if (!user)
            throw new common_1.ForbiddenException('User not found');
        const pwMatches = await argon.verify(user.hash, dto.password);
        if (!pwMatches)
            throw new common_1.ForbiddenException('Incorrect old password');
        const newHash = await argon.hash(dto.newPassword);
        if (emailValidator.validate(dto.identifier)) {
            user = await this.prisma.user.update({
                where: { email: dto.identifier },
                data: { hash: newHash },
            });
        }
        else {
            user = await this.prisma.user.update({
                where: { username: dto.identifier },
                data: { hash: newHash },
            });
        }
        return { message: 'Password changed successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map