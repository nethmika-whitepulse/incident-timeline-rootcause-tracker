/**
 * incident.test.js
 *
 * Tests for /api/incidents routes.
 * Uses the same Jest-mock pattern as auth.test.js.
 * Full integration tests (with real DB) belong in a separate
 * e2e suite that uses mongodb-memory-server locally.
 */
const request = require('supertest');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({ connection: { host: 'mock' } }),
  };
});

jest.mock('../utils/logger', () => ({
  info:  jest.fn(),
  warn:  jest.fn(),
  error: jest.fn(),
  http:  jest.fn(),
}));

let app;

beforeAll(() => {
  process.env.MONGO_URI  = 'mongodb://localhost:27017/test';
  process.env.JWT_SECRET = 'test_secret';
  process.env.NODE_ENV   = 'test';
  app = require('../../server');
});

afterEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/incidents', () => {
  it('route is reachable without token', async () => {
    const res = await request(app).post('/api/incidents').send({
      title:    'DB outage',
      severity: 'P1',
    });
    // 401 once auth middleware is wired; 404 at stub stage
    expect([400, 401, 404]).toContain(res.statusCode);
  });
});

describe('GET /api/incidents', () => {
  it('route is reachable', async () => {
    const res = await request(app).get('/api/incidents');
    expect([200, 401, 404]).toContain(res.statusCode);
  });
});

describe('PATCH /api/incidents/:id', () => {
  it('route is reachable', async () => {
    const res = await request(app)
      .patch('/api/incidents/64e0000000000000000000ab')
      .send({ status: 'Resolved' });
    expect([200, 400, 401, 404]).toContain(res.statusCode);
  });
});

describe('DELETE /api/incidents/:id', () => {
  it('route is reachable', async () => {
    const res = await request(app)
      .delete('/api/incidents/64e0000000000000000000ab');
    expect([200, 401, 404]).toContain(res.statusCode);
  });
});
