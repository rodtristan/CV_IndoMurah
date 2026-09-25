import { Global, Module } from '@nestjs/common';
import { AuthzService } from './authz-service';
import { AdminRouteGuard } from '../guards/admin-route-guard';

@Global()
@Module({
  providers: [AuthzService, AdminRouteGuard],
  exports: [AuthzService, AdminRouteGuard],
})
export class AuthzModule {}
