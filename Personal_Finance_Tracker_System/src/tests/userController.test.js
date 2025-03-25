const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

jest.mock('../models/userModel');
jest.mock('bcryptjs');

const app = express();
app.use(bodyParser.json());

// Middleware to mock req.user
app.use((req, res, next) => {
    req.user = { id: 'userId' };
    next();
});

app.get('/user/profile', getUserProfile);
app.put('/user/profile', updateUserProfile);

describe('User Controller', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    describe('getUserProfile', () => {
    
        it('should return 500 if there is a server error', async () => {
            User.findById.mockImplementation(() => ({
                select: jest.fn().mockRejectedValue(new Error('Server Error'))
            }));

            const res = await request(app)
                .get('/user/profile');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile successfully', async () => {
            User.findById.mockResolvedValue({
                _id: 'userId',
                name: 'John Doe',
                email: 'john@example.com',
                save: jest.fn().mockResolvedValue({ _id: 'userId', name: 'John Doe', email: 'john@example.com', role: 'user' })
            });
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');

            const res = await request(app)
                .put('/user/profile')
                .send({ name: 'John Doe', email: 'john@example.com', password: 'newPassword' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ _id: 'userId', name: 'John Doe', email: 'john@example.com', role: 'user', message: 'Profile updated successfully' });
        });

        it('should return 404 if user is not found', async () => {
            User.findById.mockResolvedValue(null);

            const res = await request(app)
                .put('/user/profile')
                .send({ name: 'John Doe', email: 'john@example.com', password: 'newPassword' });

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'User not found' });
        });

        it('should return 500 if there is a server error', async () => {
            User.findById.mockRejectedValue(new Error('Server Error'));

            const res = await request(app)
                .put('/user/profile')
                .send({ name: 'John Doe', email: 'john@example.com', password: 'newPassword' });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
        });
    });
});
