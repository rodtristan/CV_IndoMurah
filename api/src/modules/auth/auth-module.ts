import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth-controller';
import { AuthService } from './auth-service';
import { JwtStrategy } from '../../common/strategies/jwt-strategy';
import { MenuModule } from '../menu/menu-module';

@Module({
  imports: [
    MenuModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<JwtModuleOptions> => ({
        secret: config.get<string>('JWT_SECRET') || config.get<string>('jwt.secret') || 'fallback-secret',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || config.get<string>('jwt.expiresIn') || '8h',
        } as any,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
