const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getAllBudgets } = require('../controllers/adminController');
const Budget = require('../models/budgetModel');

jest.mock('../models/budgetModel');

const app = express();
app.use(bodyParser.json());
app.get('/budgets', getAllBudgets);

describe('Admin Controller', () => {
  describe('getAllBudgets', () => {
    it('should retrieve all budgets successfully', async () => {
      const mockPopulate = jest.fn().mockResolvedValue([
        { _id: 'budgetId1', user: { name: 'John Doe', email: 'john@example.com' }, amount: 1000 },
        { _id: 'budgetId2', user: { name: 'Jane Doe', email: 'jane@example.com' }, amount: 2000 },
      ]);
      Budget.find.mockReturnValue({ populate: mockPopulate });

      const res = await request(app).get('/budgets');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { _id: 'budgetId1', user: { name: 'John Doe', email: 'john@example.com' }, amount: 1000 },
        { _id: 'budgetId2', user: { name: 'Jane Doe', email: 'jane@example.com' }, amount: 2000 },
      ]);
    });

    it('should return 500 if there is a server error', async () => {
      const mockPopulate = jest.fn().mockRejectedValue(new Error('Server Error'));
      Budget.find.mockReturnValue({ populate: mockPopulate });

      const res = await request(app).get('/budgets');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
    });
  });
});