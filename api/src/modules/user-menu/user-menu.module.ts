import { Module } from '@nestjs/common';
import { UserMenuController } from './user-menu.controller';
import { UserMenuService } from './user-menu.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [UserMenuController],
  providers: [UserMenuService],
  exports: [UserMenuService],
})
export class UserMenuModule {}
