import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LinkModule } from './link/link.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FoldernpxController } from './nest/foldernpx/foldernpx.controller';
import { FolderService } from './folder/folder.service';
import { FolderController } from './folder/folder.controller';
import { FolderModule } from './folder/folder.module';
import { ItemsModule } from './items/items.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    LinkModule,
    PrismaModule,
    FolderModule,
    ItemsModule,
  ],
  controllers: [
    FoldernpxController,
    FolderController,
  ],
  providers: [FolderService],
})
export class AppModule {}
