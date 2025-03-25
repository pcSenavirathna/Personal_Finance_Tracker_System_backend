const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { notifyUserAboutSpending, notifyUserAboutUpcomingPayments, notifyUserAboutFinancialGoal } = require('../controllers/notificationController');
const User = require('../models/userModel');
const { sendEmailNotification } = require('../utils/emailSender');

jest.mock('../models/userModel');
jest.mock('../utils/emailSender');

const app = express();
app.use(bodyParser.json());
app.post('/notify/spending', notifyUserAboutSpending);
app.post('/notify/upcoming-payments', notifyUserAboutUpcomingPayments);
app.post('/notify/financial-goal', notifyUserAboutFinancialGoal);

describe('Notification Controller', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  describe('notifyUserAboutSpending', () => {
    it('should send a notification if spending exceeds limit', async () => {
      User.findById.mockResolvedValue({ email: 'user@example.com' });
      sendEmailNotification.mockResolvedValue();

      const res = await request(app)
        .post('/notify/spending')
        .send({ userId: 'userId', category: 'Food', amountSpent: 150, limit: 100 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Notification sent successfully' });
    });

    it('should return 404 if user is not found', async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/notify/spending')
        .send({ userId: 'userId', category: 'Food', amountSpent: 150, limit: 100 });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return 500 if there is a server error', async () => {
      User.findById.mockRejectedValue(new Error('Server Error'));

      const res = await request(app)
        .post('/notify/spending')
        .send({ userId: 'userId', category: 'Food', amountSpent: 150, limit: 100 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
    });
  });

  describe('notifyUserAboutUpcomingPayments', () => {
    it('should send a reminder if the due date is approaching', async () => {
      User.findById.mockResolvedValue({ email: 'user@example.com' });
      sendEmailNotification.mockResolvedValue();

      const res = await request(app)
        .post('/notify/upcoming-payments')
        .send({ userId: 'userId', amount: 200, category: 'Rent', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Reminder sent successfully' });
    });

    it('should return 404 if user is not found', async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/notify/upcoming-payments')
        .send({ userId: 'userId', amount: 200, category: 'Rent', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return 500 if there is a server error', async () => {
      User.findById.mockRejectedValue(new Error('Server Error'));

      const res = await request(app)
        .post('/notify/upcoming-payments')
        .send({ userId: 'userId', amount: 200, category: 'Rent', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
    });
  });

  describe('notifyUserAboutFinancialGoal', () => {
    it('should send a reminder if the goal target date is approaching', async () => {
      User.findById.mockResolvedValue({ email: 'user@example.com' });
      sendEmailNotification.mockResolvedValue();

      const res = await request(app)
        .post('/notify/financial-goal')
        .send({ userId: 'userId', goalAmount: 1000, currentAmount: 800, goalDescription: 'Vacation', targetDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Goal reminder sent successfully' });
    });

    it('should return 404 if user is not found', async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/notify/financial-goal')
        .send({ userId: 'userId', goalAmount: 1000, currentAmount: 800, goalDescription: 'Vacation', targetDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return 500 if there is a server error', async () => {
      User.findById.mockRejectedValue(new Error('Server Error'));

      const res = await request(app)
        .post('/notify/financial-goal')
        .send({ userId: 'userId', goalAmount: 1000, currentAmount: 800, goalDescription: 'Vacation', targetDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
    });
  });
});