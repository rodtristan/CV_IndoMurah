import { Module } from '@nestjs/common';
import { UserController } from './user-controller';
import { UserService } from './user-service';
import { MenuModule } from '../menu/menu-module';

@Module({
  imports: [MenuModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
