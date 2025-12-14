import { Router } from 'express';
import { getSession } from '../db/neo4j.js';
import neo4j from 'neo4j-driver';

export const router = Router();

router.get('/people', async (req, res, next) => {
  const q = req.query.search || '';
  const session = getSession();
  try {
    const cypher = q
      ? 'MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower($q) RETURN p ORDER BY p.name LIMIT 50'
      : 'MATCH (p:Person) RETURN p ORDER BY p.name LIMIT 50';
    const result = await session.run(cypher, { q });
    const people = result.records.map(r => r.get('p').properties);
    res.json({ items: people });
  } catch (e) {
    next(e);
  } finally {
    await session.close();
  }
});

router.get('/movies', async (req, res, next) => {
  const q = req.query.search || '';
  const session = getSession();
  try {
    const cypher = q
      ? 'MATCH (m:Movie) WHERE toLower(m.title) CONTAINS toLower($q) RETURN m ORDER BY m.title LIMIT 50'
      : 'MATCH (m:Movie) RETURN m ORDER BY m.title LIMIT 50';
    const result = await session.run(cypher, { q });
    const movies = result.records.map(r => r.get('m').properties);
    res.json({ items: movies });
  } catch (e) {
    next(e);
  } finally {
    await session.close();
  }
});

router.post('/people', async (req, res, next) => {
  const { name, born } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const session = getSession();
  try {
    const result = await session.run(
      'MERGE (p:Person {name: $name}) SET p.born = coalesce($born, p.born) RETURN p',
      { name, born }
    );
    const person = result.records[0]?.get('p').properties;
    res.status(201).json({ item: person });
  } catch (e) {
    next(e);
  } finally {
    await session.close();
  }
});

router.post('/movies', async (req, res, next) => {
  const { title, released } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const session = getSession();
  try {
    const result = await session.run(
      'MERGE (m:Movie {title: $title}) SET m.released = coalesce($released, m.released) RETURN m',
      { title, released }
    );
    const movie = result.records[0]?.get('m').properties;
    res.status(201).json({ item: movie });
  } catch (e) {
    next(e);
  } finally {
    await session.close();
  }
});

router.post('/acted-in', async (req, res, next) => {
  const { personName, movieTitle, roles } = req.body || {};
  if (!personName || !movieTitle) {
    return res.status(400).json({ error: 'personName and movieTitle are required' });
  }
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $personName}), (m:Movie {title: $movieTitle})
       MERGE (p)-[r:ACTED_IN]->(m)
       SET r.roles = coalesce($roles, r.roles)
       RETURN p, m, r`,
      { personName, movieTitle, roles }
    );
    const ok = Boolean(result.records[0]);
    res.status(ok ? 201 : 404).json({ ok });
  } catch (e) {
    next(e);
  } finally {
    await session.close();
  }
});

router.get('/graph', async (req, res, next) => {
  const raw = req.query.limit;
  let limit = Number.isFinite(raw) ? raw : parseInt(raw, 10);
  if (!Number.isFinite(limit) || limit < 0) limit = 50;
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)
       RETURN p, r, m
       LIMIT $limit`,
      { limit: neo4j.int(Math.trunc(limit)) }
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
    res.json({
      nodes: Array.from(nodesMap.values()),
      links,
    });
  } catch (e) {
    next(e);
  } finally {
    await session.close();
  }
});

// Basic error handler
router.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', message: String(err?.message || err) });
});
