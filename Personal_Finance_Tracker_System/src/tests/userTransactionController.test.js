const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { addTransaction, getTransactions, updateTransaction, deleteTransaction, generateReport } = require('../controllers/userTransactionController');
const Transaction = require('../models/transactionModel');
const Budget = require('../models/budgetModel');
const Goal = require('../models/goalModel');
const User = require('../models/userModel');
const { sendEmailNotification } = require('../utils/emailSender');
const { convertCurrency } = require('../utils/currencyConverter');

jest.mock('../models/transactionModel');
jest.mock('../models/budgetModel');
jest.mock('../models/goalModel');
jest.mock('../models/userModel');
jest.mock('../utils/emailSender');
jest.mock('../utils/currencyConverter');

const app = express();
app.use(bodyParser.json());

// Middleware to mock req.user
app.use((req, res, next) => {
    req.user = { id: 'userId', preferredCurrency: 'USD' };
    next();
});

app.post('/transaction', addTransaction);
app.get('/transactions', getTransactions);
app.put('/transaction/:id', updateTransaction);
app.delete('/transaction/:id', deleteTransaction);
app.get('/report', generateReport);

describe('User Transaction Controller', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    describe('addTransaction', () => {
        it('should add a new transaction successfully', async () => {
            User.findById.mockResolvedValue({ preferredCurrency: 'USD' });
            Transaction.create.mockResolvedValue({ _id: 'transactionId', user: 'userId', type: 'income', category: 'Salary', amount: 1000 });

            const res = await request(app)
                .post('/transaction')
                .send({ type: 'income', category: 'Salary', amount: 1000, currency: 'USD' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ _id: 'transactionId', user: 'userId', type: 'income', category: 'Salary', amount: 1000 });
        });

        it('should return 500 if there is a server error', async () => {
            User.findById.mockResolvedValue({ preferredCurrency: 'USD' });
            Transaction.create.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .post('/transaction')
                .send({ type: 'income', category: 'Salary', amount: 1000, currency: 'USD' });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });

    describe('getTransactions', () => {
        it('should return all transactions for a user', async () => {
            Transaction.find.mockImplementation(() => ({
                sort: jest.fn().mockResolvedValue([{ _id: 'transactionId', user: 'userId', type: 'income', category: 'Salary', amount: 1000 }])
            }));

            const res = await request(app)
                .get('/transactions');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ _id: 'transactionId', user: 'userId', type: 'income', category: 'Salary', amount: 1000 }]);
        });

        it('should return 500 if there is a server error', async () => {
            Transaction.find.mockImplementation(() => ({
                sort: jest.fn().mockRejectedValue(new Error('Server Error'))
            }));

            const res = await request(app)
                .get('/transactions');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });

    describe('updateTransaction', () => {
        it('should return 404 if transaction is not found', async () => {
            Transaction.findById.mockResolvedValue(null);

            const res = await request(app)
                .put('/transaction/transactionId')
                .send({ amount: 1500 });

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Transaction not found or unauthorized' });
        });

        it('should update a transaction successfully', async () => {
            Transaction.findById.mockResolvedValue({ _id: 'transactionId', user: 'userId' });
            Transaction.findByIdAndUpdate.mockResolvedValue({ _id: 'transactionId', user: 'userId', amount: 1500 });

            const res = await request(app)
                .put('/transaction/transactionId')
                .send({ amount: 1500 });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ _id: 'transactionId', user: 'userId', amount: 1500 });
        });

        it('should return 500 if there is a server error', async () => {
            Transaction.findById.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .put('/transaction/transactionId')
                .send({ amount: 1500 });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });

    describe('deleteTransaction', () => {
        it('should delete a transaction successfully', async () => {
            Transaction.findById.mockResolvedValue({ _id: 'transactionId', user: 'userId' });
            Transaction.deleteOne.mockResolvedValue({});

            const res = await request(app)
                .delete('/transaction/transactionId');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Transaction deleted successfully' });
        });

        it('should return 404 if transaction is not found', async () => {
            Transaction.findById.mockResolvedValue(null);

            const res = await request(app)
                .delete('/transaction/transactionId');

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Transaction not found or unauthorized' });
        });

        it('should return 500 if there is a server error', async () => {
            Transaction.findById.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .delete('/transaction/transactionId');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });

    describe('generateReport', () => {
        it('should return 500 if there is a server error', async () => {
            Transaction.find.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .get('/report');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });
});