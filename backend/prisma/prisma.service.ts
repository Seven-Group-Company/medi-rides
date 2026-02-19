import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbUrl = process.env.DATABASE_URL || '';
    const hasSslParam = dbUrl.includes('sslmode=');
    const defaultSslMode = process.env.DB_SSLMODE || (process.env.NODE_ENV === 'production' ? 'require' : 'disable');
    const url = hasSslParam || dbUrl === ''
      ? dbUrl
      : dbUrl + (dbUrl.includes('?') ? '&' : '?') + `sslmode=${defaultSslMode}`;

    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'colorless',
      datasources: {
        db: { url }
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}