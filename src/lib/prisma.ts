import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/client";

const connectionString = process.env.DATABASE_URL;

// 1. Create a Postgres connection pool
const pool = new Pool({ connectionString });

// 2. Create the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Define the global type to prevent multiple instances in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 4. Initialize Prisma with the adapter
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
