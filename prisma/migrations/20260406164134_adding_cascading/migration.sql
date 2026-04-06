-- DropForeignKey
ALTER TABLE "Clients" DROP CONSTRAINT "Clients_userId_fkey";

-- DropForeignKey
ALTER TABLE "Otps" DROP CONSTRAINT "Otps_userId_fkey";

-- DropForeignKey
ALTER TABLE "Platforms" DROP CONSTRAINT "Platforms_clientId_fkey";

-- AddForeignKey
ALTER TABLE "Clients" ADD CONSTRAINT "Clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Platforms" ADD CONSTRAINT "Platforms_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Otps" ADD CONSTRAINT "Otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
