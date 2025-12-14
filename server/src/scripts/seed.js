import dotenv from 'dotenv';
dotenv.config();
import { getSession, closeDriver } from '../db/neo4j.js';

async function run() {
  const session = getSession();
  try {
    console.log('Creating constraints...');
    await session.run(
      'CREATE CONSTRAINT person_name IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE'
    );
    await session.run(
      'CREATE CONSTRAINT movie_title IF NOT EXISTS FOR (m:Movie) REQUIRE m.title IS UNIQUE'
    );

    console.log('Seeding sample data...');
    await session.executeWrite(async tx => {
      await tx.run('MERGE (p:Person {name: $name}) SET p.born = $born', { name: 'Keanu Reeves', born: 1964 });
      await tx.run('MERGE (p:Person {name: $name}) SET p.born = $born', { name: 'Carrie-Anne Moss', born: 1967 });
      await tx.run('MERGE (p:Person {name: $name}) SET p.born = $born', { name: 'Laurence Fishburne', born: 1961 });
      await tx.run('MERGE (m:Movie {title: $title}) SET m.released = $released', { title: 'The Matrix', released: 1999 });
      await tx.run('MERGE (m:Movie {title: $title}) SET m.released = $released', { title: 'John Wick', released: 2014 });
      await tx.run(
        `MATCH (p:Person {name: 'Keanu Reeves'}), (m:Movie {title: 'The Matrix'})
         MERGE (p)-[r:ACTED_IN]->(m) SET r.roles = ['Neo']`
      );
      await tx.run(
        `MATCH (p:Person {name: 'Carrie-Anne Moss'}), (m:Movie {title: 'The Matrix'})
         MERGE (p)-[r:ACTED_IN]->(m) SET r.roles = ['Trinity']`
      );
      await tx.run(
        `MATCH (p:Person {name: 'Laurence Fishburne'}), (m:Movie {title: 'The Matrix'})
         MERGE (p)-[r:ACTED_IN]->(m) SET r.roles = ['Morpheus']`
      );
      await tx.run(
        `MATCH (p:Person {name: 'Keanu Reeves'}), (m:Movie {title: 'John Wick'})
         MERGE (p)-[r:ACTED_IN]->(m) SET r.roles = ['John Wick']`
      );
    });
    console.log('Done.');
  } finally {
    await session.close();
    await closeDriver();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });

