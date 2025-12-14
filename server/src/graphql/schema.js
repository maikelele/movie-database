import { buildSchema } from 'graphql';
import { getSession } from '../db/neo4j.js';
import neo4j from 'neo4j-driver';

export const schema = buildSchema(`
  type Person {
    name: String!
    born: Int
    actedIn: [Movie!]!
  }

  type Movie {
    title: String!
    released: Int
    actors: [Person!]!
  }

  type Node {
    id: ID!
    label: String!
    group: String!
  }

  type Link {
    source: ID!
    target: ID!
    label: String!
    roles: [String!]
  }

  type Graph {
    nodes: [Node!]!
    links: [Link!]!
  }

  type Query {
    people(search: String): [Person!]!
    movies(search: String): [Movie!]!
    graph(limit: Int = 50): Graph!
  }

  type Mutation {
    addPerson(name: String!, born: Int): Person!
    addMovie(title: String!, released: Int): Movie!
    addActedIn(personName: String!, movieTitle: String!, roles: [String!]): Boolean!
  }
`);

export const rootValue = {
  async people({ search }) {
    const session = getSession();
    try {
      const cypher = search
        ? 'MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower($q) RETURN p ORDER BY p.name LIMIT 50'
        : 'MATCH (p:Person) RETURN p ORDER BY p.name LIMIT 50';
      const result = await session.run(cypher, { q: search || '' });
      return result.records.map(r => {
        const props = r.get('p').properties;
        return {
          ...props,
          actedIn: async () => {
            const s2 = getSession();
            try {
              const r2 = await s2.run(
                'MATCH (p:Person {name: $name})-[:ACTED_IN]->(m:Movie) RETURN m ORDER BY m.title',
                { name: props.name }
              );
              return r2.records.map(rr => rr.get('m').properties);
            } finally { await s2.close(); }
          },
        };
      });
    } finally {
      await session.close();
    }
  },
  async movies({ search }) {
    const session = getSession();
    try {
      const cypher = search
        ? 'MATCH (m:Movie) WHERE toLower(m.title) CONTAINS toLower($q) RETURN m ORDER BY m.title LIMIT 50'
        : 'MATCH (m:Movie) RETURN m ORDER BY m.title LIMIT 50';
      const result = await session.run(cypher, { q: search || '' });
      return result.records.map(r => {
        const props = r.get('m').properties;
        return {
          ...props,
          actors: async () => {
            const s2 = getSession();
            try {
              const r2 = await s2.run(
                'MATCH (m:Movie {title: $title})<-[:ACTED_IN]-(p:Person) RETURN p ORDER BY p.name',
                { title: props.title }
              );
              return r2.records.map(rr => rr.get('p').properties);
            } finally { await s2.close(); }
          },
        };
      });
    } finally {
      await session.close();
    }
  },
  async graph({ limit }) {
    const session = getSession();
    const lim = Number.isFinite(limit) && limit >= 0 ? Math.trunc(limit) : 50;
    try {
      const result = await session.run(
        `MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)
         RETURN p, r, m
         LIMIT $limit`,
        { limit: neo4j.int(lim) }
      );
      const nodesMap = new Map();
      const links = [];
      for (const rec of result.records) {
        const p = rec.get('p');
        const m = rec.get('m');
        const r = rec.get('r');
        const pid = p.identity.toString();
        const mid = m.identity.toString();
        if (!nodesMap.has(pid)) nodesMap.set(pid, { id: pid, label: p.properties.name, group: 'Person' });
        if (!nodesMap.has(mid)) nodesMap.set(mid, { id: mid, label: m.properties.title, group: 'Movie' });
        links.push({ source: pid, target: mid, label: 'ACTED_IN', roles: r.properties.roles || [] });
      }
      return { nodes: [...nodesMap.values()], links };
    } finally {
      await session.close();
    }
  },
  async addPerson({ name, born }) {
    const session = getSession();
    try {
      const result = await session.run(
        'MERGE (p:Person {name: $name}) SET p.born = coalesce($born, p.born) RETURN p',
        { name, born }
      );
      return result.records[0].get('p').properties;
    } finally {
      await session.close();
    }
  },
  async addMovie({ title, released }) {
    const session = getSession();
    try {
      const result = await session.run(
        'MERGE (m:Movie {title: $title}) SET m.released = coalesce($released, m.released) RETURN m',
        { title, released }
      );
      return result.records[0].get('m').properties;
    } finally {
      await session.close();
    }
  },
  async addActedIn({ personName, movieTitle, roles }) {
    const session = getSession();
    try {
      const result = await session.run(
        `MATCH (p:Person {name: $personName}), (m:Movie {title: $movieTitle})
         MERGE (p)-[r:ACTED_IN]->(m)
         SET r.roles = coalesce($roles, r.roles)
         RETURN r`,
        { personName, movieTitle, roles }
      );
      return Boolean(result.records[0]);
    } finally {
      await session.close();
    }
  },
};
