import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "",
});
const seedPrismaClient = new PrismaClient({ adapter });

export { seedPrismaClient };
