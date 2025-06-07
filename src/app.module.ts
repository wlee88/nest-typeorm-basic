import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { Signer } from '@aws-sdk/rds-signer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => {
        // const host = cfg.getOrThrow('DB_HOST')
        // const port = cfg.getOrThrow('DB_PORT')
        // const username = cfg.getOrThrow('DB_USER')
        // const password = cfg.getOrThrow('DB_PASSWORD')
        const host = "localhost"
        const port = 5432
        const username = "postgres"
        let changeme = "wrong"
        let password = async () => await Promise.resolve(changeme)

        console.log({host, port, username, password: await password() })

        return {
          type: 'postgres',
          host,
          port,
          username,
          password, 
          toRetry(err: Error) {
            console.error('POOL ERROR HANDLER')
            console.log({err})
            changeme = "password"
            return true
          },
          dataSourceFactory: async (options?: DataSourceOptions) => createPostgresDataSource,
        }
      }
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


export const createPostgresDataSource = async (options: DataSourceOptions): Promise<DataSource> => {
  const dataSource = new DataSource(options)
  // @ts-expect-error TypeORM does not support custom types defined in Postgres
  dataSource.driver.supportedDataTypes.push('timerange')
  return dataSource
}