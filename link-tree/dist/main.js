"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const session = require("express-session");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
    }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'profile-images'));
    app.enableCors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    });
    const config = app.get(config_1.ConfigService);
    const sessionDuration = config.get('SESSION_DURATION');
    const sessionSecret = config.get('SESSION_SECRET');
    app.use(session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: sessionDuration },
    }));
    await app.listen(3333);
}
bootstrap();
//# sourceMappingURL=main.js.map