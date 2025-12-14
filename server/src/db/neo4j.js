import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure env is loaded even when imported before other modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;
const database = process.env.NEO4J_DATABASE || 'neo4j';

if (!uri || !user || !password) {
  throw new Error('Neo4j configuration missing. Set NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD in .env');
}

export const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export function getSession() {
  return driver.session({ database });
}

export async function closeDriver() {
  await driver.close();
}
