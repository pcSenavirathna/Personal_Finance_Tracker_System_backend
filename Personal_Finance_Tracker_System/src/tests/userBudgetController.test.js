const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { setBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/userBudgetController');
const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const { sendEmailNotification } = require('../utils/emailSender');

jest.mock('../models/budgetModel');
jest.mock('../models/transactionModel');
jest.mock('../models/userModel');
jest.mock('../utils/emailSender');

const app = express();
app.use(bodyParser.json());

// Middleware to mock req.user
app.use((req, res, next) => {
    req.user = { id: 'userId' };
    next();
});

app.post('/budget', setBudget);
app.get('/budgets', getBudgets);
app.put('/budget/:id', updateBudget);
app.delete('/budget/:id', deleteBudget);

describe('User Budget Controller', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    describe('setBudget', () => {
        it('should set a new budget successfully', async () => {
            Budget.findOne.mockResolvedValue(null);
            Budget.create.mockResolvedValue({ _id: 'budgetId', user: 'userId', category: 'Food', limit: 500, month: 'January', year: 2025 });

            const res = await request(app)
                .post('/budget')
                .send({ category: 'Food', limit: 500, month: 'January', year: 2025 });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ _id: 'budgetId', user: 'userId', category: 'Food', limit: 500, month: 'January', year: 2025 });
        });

        it('should return 400 if budget already exists', async () => {
            Budget.findOne.mockResolvedValue({ _id: 'budgetId' });

            const res = await request(app)
                .post('/budget')
                .send({ category: 'Food', limit: 500, month: 'January', year: 2025 });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Budget already exists for Food in January 2025' });
        });

        it('should return 500 if there is a server error', async () => {
            Budget.findOne.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .post('/budget')
                .send({ category: 'Food', limit: 500, month: 'January', year: 2025 });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });

    describe('getBudgets', () => {
        it('should return all budgets for a user', async () => {
            Budget.find.mockResolvedValue([{ _id: 'budgetId', user: 'userId', category: 'Food', limit: 500, month: 'January', year: 2025 }]);

            const res = await request(app)
                .get('/budgets');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ _id: 'budgetId', user: 'userId', category: 'Food', limit: 500, month: 'January', year: 2025 }]);
        });

        it('should return 404 if no budgets are found', async () => {
            Budget.find.mockResolvedValue([]);

            const res = await request(app)
                .get('/budgets');

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'No budgets found for this user' });
        });

        it('should return 500 if there is a server error', async () => {
            Budget.find.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .get('/budgets');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });

    describe('updateBudget', () => {
        it('should return 404 if budget is not found', async () => {
            Budget.findById.mockResolvedValue(null);

            const res = await request(app)
                .put('/budget/budgetId')
                .send({ category: 'Food', limit: 600, month: 'January', year: 2025 });

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Budget not found or unauthorized' });
        });

        it('should return 500 if there is a server error', async () => {
            Budget.findById.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .put('/budget/budgetId')
                .send({ category: 'Food', limit: 600, month: 'January', year: 2025 });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });

    describe('deleteBudget', () => {
        it('should delete a budget successfully', async () => {
            Budget.findById.mockResolvedValue({ _id: 'budgetId', user: 'userId' });
            Budget.findByIdAndDelete.mockResolvedValue({});

            const res = await request(app)
                .delete('/budget/budgetId');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Budget deleted successfully' });
        });

        it('should return 404 if budget is not found', async () => {
            Budget.findById.mockResolvedValue(null);

            const res = await request(app)
                .delete('/budget/budgetId');

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Budget not found or unauthorized' });
        });

        it('should return 500 if there is a server error', async () => {
            Budget.findById.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .delete('/budget/budgetId');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });
});