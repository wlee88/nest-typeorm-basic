import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { Signer } from '@aws-sdk/rds-signer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => {
        const cachedToken = ''
        let tokenExpiration = 0
        const host = cfg.getOrThrow('DB_HOST')
        const port = cfg.getOrThrow('DB_PORT')
        const username = cfg.getOrThrow('DB_USER')
        const region = cfg.getOrThrow('AWS_REGION')

        return {
          type: 'postgres',
          host,
          port,
          username,
          password: async () => {
            try {
              const signer = new Signer({
                hostname: host,
                port,
                username,
                region,
              })
              const now = new Date().getTime()
        
              if (tokenExpiration !== 0 && cachedToken && now < tokenExpiration) {
                return cachedToken
              }
              
              console.log('10 minutes stale - getting new auth token')
              const token = signer.getAuthToken()
              // Token Expires every 15 minutes / so refresh every 10
              tokenExpiration = now + 10 * 60 * 1000
        
              return token
            } catch (e) {
              console.error({e})
              console.error('something went badly wrong')
              throw e
            }
          }, // Get from rds presign
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true, // NOTE: disable in production
          ssl: {
            rejectUnauthorized: false  // Or true if using a trusted cert
          }
        }
      }
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
