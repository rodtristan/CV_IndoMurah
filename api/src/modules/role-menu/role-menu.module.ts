import { Module } from '@nestjs/common';
import { RoleMenuController } from './role-menu.controller';
import { RoleMenuService } from './role-menu.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [RoleMenuController],
  providers: [RoleMenuService],
  exports: [RoleMenuService],
})
export class RoleMenuModule {}
