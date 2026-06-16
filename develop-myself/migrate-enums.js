import { PrismaClient } from './app/lib/prisma-client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting schema migration script...');

  try {
    // Create enums
    await prisma.$executeRawUnsafe(`CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE');`).catch(e => console.log('user_status may already exist'));
    await prisma.$executeRawUnsafe(`CREATE TYPE "page_type" AS ENUM ('NOTE', 'GOAL', 'PROJECT', 'JOURNAL', 'ROADMAP', 'TASK_LIST', 'KNOWLEDGE');`).catch(e => console.log('page_type may already exist'));
    await prisma.$executeRawUnsafe(`CREATE TYPE "page_kind" AS ENUM ('DOCUMENT', 'FOLDER');`).catch(e => console.log('page_kind may already exist'));

    console.log('Created enums.');

    // Alter users table
    await prisma.$executeRawUnsafe(`ALTER TABLE "users" ALTER COLUMN "status" TYPE "user_status" USING "status"::text::"user_status";`).catch(e => console.error(e.message));

    // Alter pages table
    await prisma.$executeRawUnsafe(`ALTER TABLE "pages" ALTER COLUMN "page_type" TYPE "page_type" USING "page_type"::text::"page_type";`).catch(e => console.error(e.message));
    await prisma.$executeRawUnsafe(`ALTER TABLE "pages" ALTER COLUMN "kind" TYPE "page_kind" USING "kind"::text::"page_kind";`).catch(e => console.error(e.message));

    // Alter page_templates table
    await prisma.$executeRawUnsafe(`ALTER TABLE "page_templates" ALTER COLUMN "page_type" TYPE "page_type" USING "page_type"::text::"page_type";`).catch(e => console.error(e.message));

    console.log('Successfully altered columns to use enums.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
