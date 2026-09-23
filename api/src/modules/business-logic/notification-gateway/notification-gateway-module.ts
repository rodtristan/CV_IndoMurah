import { Module } from '@nestjs/common';
import { NotificationGatewayController } from './notification-gateway-controller';
import { NotificationGatewayService } from './notification-gateway-service';

@Module({
  controllers: [NotificationGatewayController],
  providers: [NotificationGatewayService],
  exports: [NotificationGatewayService],
})
export class NotificationGatewayModule {}
