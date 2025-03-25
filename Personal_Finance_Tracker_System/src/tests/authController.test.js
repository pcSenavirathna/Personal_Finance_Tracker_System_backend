const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { registerUser, loginUser } = require('../controllers/authController');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../models/userModel');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

const app = express();
app.use(bodyParser.json());
app.post('/register', registerUser);
app.post('/login', loginUser);

describe('Auth Controller', () => {
  describe('registerUser', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'userId',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'user',
      });
      jwt.sign.mockReturnValue('token');

      const res = await request(app)
        .post('/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        _id: 'userId',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        token: 'token',
      });
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'john@example.com' });

      const res = await request(app)
        .post('/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'User already exists' });
    });

    it('should return 500 if there is a server error', async () => {
      User.findOne.mockRejectedValue(new Error('Server Error'));

      const res = await request(app)
        .post('/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('loginUser', () => {
    it('should login a user', async () => {
      User.findOne.mockResolvedValue({
        _id: 'userId',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'user',
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      const res = await request(app)
        .post('/login')
        .send({ email: 'john@example.com', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        _id: 'userId',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        token: 'token',
      });
    });

    it('should return 400 if invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({ email: 'john@example.com', password: 'password' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid Credentials' });
    });

    it('should return 500 if there is a server error', async () => {
      User.findOne.mockRejectedValue(new Error('Server Error'));

      const res = await request(app)
        .post('/login')
        .send({ email: 'john@example.com', password: 'password' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });

    it('should return 400 if password does not match', async () => {
      User.findOne.mockResolvedValue({
        _id: 'userId',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'user',
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/login')
        .send({ email: 'john@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid Credentials' });
    });
  });
});