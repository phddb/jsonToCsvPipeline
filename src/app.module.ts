import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from './item/item.module';

const databaseConfig = process.env.DATABASE_URL
  ? {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Creates tables on first deploy. Use migrations for production.
    }
  : {
      type: 'postgres' as const,
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'items_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    };

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), ItemModule],
})
export class AppModule {}
