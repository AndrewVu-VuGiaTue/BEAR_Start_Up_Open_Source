const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth APIs', () => {
  test('POST /api/auth/register - tạo user mới và trả JSON chuẩn', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'secret' })
      .expect(201);

    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', 'alice');
    expect(res.body.user).toHaveProperty('email', 'alice@example.com');
  });

  test('POST /api/auth/register - lỗi khi trùng email hoặc username', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob', email: 'bob@example.com', password: 'pw' })
      .expect(201);

    const dupEmail = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob2', email: 'bob@example.com', password: 'pw' })
      .expect(400);
    expect(dupEmail.body).toHaveProperty('message');

    const dupUsername = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob', email: 'bob2@example.com', password: 'pw' })
      .expect(400);
    expect(dupUsername.body).toHaveProperty('message');
  });

  test('POST /api/auth/login - đăng nhập thành công', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'charlie', email: 'charlie@example.com', password: 'secret' })
      .expect(201);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'charlie@example.com', password: 'secret' })
      .expect(200);

    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'charlie@example.com');
  });

  test('POST /api/auth/login - trả 400 khi sai thông tin', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'dave', email: 'dave@example.com', password: 'secret' })
      .expect(201);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'dave@example.com', password: 'wrong' })
      .expect(400);
  });
});


