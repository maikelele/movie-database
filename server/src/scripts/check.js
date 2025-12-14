import dotenv from 'dotenv';
dotenv.config();
import { getSession, closeDriver } from '../db/neo4j.js';

async function run() {
  const session = getSession();
  try {
    const res = await session.run('RETURN 1 as n');
    console.log('DB OK, RETURN n =', res.records[0].get('n').toInt?.() ?? res.records[0].get('n'));
  } finally {
    await session.close();
    await closeDriver();
  }
}

run().catch((e) => { console.error('DB check failed:', e.message); process.exit(1); });

