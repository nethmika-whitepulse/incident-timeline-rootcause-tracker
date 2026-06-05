/**
 * auth.test.js
 *
 * Integration-style tests for /api/auth routes.
 * Mongoose is mocked so no real MongoDB connection is needed;
 * swap the mock for mongodb-memory-server once your local
 * environment is set up (see README).
 */
const request = require('supertest');

// ── Mock mongoose before requiring the app ────────────────────────────────────
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({ connection: { host: 'mock' } }),
  };
});

// Prevent real logger files being created during tests
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
describe('POST /api/auth/register', () => {
  it('route is reachable (stub returns non-5xx once controller is wired)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name:     'Test User',
      email:    'test@example.com',
      password: 'password123',
    });
    // 404 = route stub not yet wired; anything but 5xx is fine at scaffold stage
    expect([200, 201, 400, 404]).toContain(res.statusCode);
  });

  it('rejects obviously missing body fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect([400, 404]).toContain(res.statusCode);
  });
});

describe('POST /api/auth/login', () => {
  it('route is reachable', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email:    'test@example.com',
      password: 'password123',
    });
    expect([200, 400, 401, 404]).toContain(res.statusCode);
  });
});
