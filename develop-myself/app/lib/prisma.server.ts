/**
 * Prisma singleton client
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import type { PrismaClient as PrismaClientType } from '@prisma/client';

const PrismaClientClass = PrismaClient;
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;


declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClientType | undefined;
}

let prisma: PrismaClientType;

const createPrismaClient = (): PrismaClientType => {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to initialize Prisma');
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma };
