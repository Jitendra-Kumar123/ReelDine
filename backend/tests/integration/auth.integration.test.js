const request = require('supertest');
const app = require('../../src/app');
const userModel = require('../../src/models/user.model');

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database if needed
  });

  afterAll(async () => {
    // Clean up
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
    });
  });
});
