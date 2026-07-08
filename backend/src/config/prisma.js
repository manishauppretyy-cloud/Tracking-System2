const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

let prisma = null;

const initPrisma = (databaseUrl) => {
  if (prisma) return prisma;

  neonConfig.webSocketConstructor = ws;

  // Strip channel_binding — not supported by @neondatabase/serverless v1
  const url = new URL(databaseUrl);
  url.searchParams.delete('channel_binding');
  const connectionString = url.toString();

  // PrismaNeon v7 takes a Pool config object, not a Pool instance
  const adapter = new PrismaNeon({ connectionString });
  prisma = new PrismaClient({ adapter });
  return prisma;
};

const getPrisma = () => {
  if (!prisma) throw new Error('Prisma not initialized. Call initPrisma(DATABASE_URL) first.');
  return prisma;
};

module.exports = new Proxy({ initPrisma }, {
  get(target, prop) {
    if (prop === 'initPrisma') return target.initPrisma;
    return getPrisma()[prop];
  },
});
