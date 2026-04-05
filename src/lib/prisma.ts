import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";

const connectionString = `${process.env.DATABASE_URL || ""}`;
const adapter = new PrismaPg({ connectionString });

const Prisma = new PrismaClient({ adapter });

export default Prisma;