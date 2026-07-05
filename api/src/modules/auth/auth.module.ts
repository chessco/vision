import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CombinedAuthGuard } from '../../common/guards/combined-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, ApiKeyGuard, CombinedAuthGuard],
  exports: [PassportModule, JwtModule, JwtStrategy, ApiKeyGuard, CombinedAuthGuard],
})
export class AuthModule {}
