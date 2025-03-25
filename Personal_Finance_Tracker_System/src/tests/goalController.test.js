const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { createGoal, getGoals, updateGoalProgress, deleteGoal } = require('../controllers/goalController');
const Goal = require('../models/goalModel');


jest.mock('../models/goalModel');
jest.mock('../models/userModel');
jest.mock('../utils/emailSender');

const app = express();
app.use(bodyParser.json());
app.post('/goals', (req, res, next) => {
  req.user = { id: 'userId' }; 
  next();
}, createGoal);
app.get('/goals', (req, res, next) => {
  req.user = { id: 'userId' }; 
  next();
}, getGoals);
app.put('/goals/progress', (req, res, next) => {
  req.user = { id: 'userId' }; 
  next();
}, updateGoalProgress);
app.delete('/goals/:id', (req, res, next) => {
  req.user = { id: 'userId' };
  next();
}, deleteGoal);

describe('Goal Controller', () => {
  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const newGoal = { _id: 'goalId', user: 'userId', goalName: 'New Goal', goalAmount: 1000, targetDate: '2025-12-31' };
      Goal.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(newGoal),
      }));

      const res = await request(app)
        .post('/goals')
        .send({ goalName: 'New Goal', goalAmount: 1000, targetDate: '2025-12-31' });

      expect(res.status).toBe(201);
    });

    it('should return 500 if there is a server error', async () => {
      Goal.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Server Error')),
      }));

      const res = await request(app)
        .post('/goals')
        .send({ goalName: 'New Goal', goalAmount: 1000, targetDate: '2025-12-31' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
    });
  });

  describe('getGoals', () => {
    it('should retrieve all goals of the user', async () => {
      const goals = [
        { _id: 'goalId1', user: 'userId', goalName: 'Goal 1', goalAmount: 1000, targetDate: '2025-12-31' },
        { _id: 'goalId2', user: 'userId', goalName: 'Goal 2', goalAmount: 2000, targetDate: '2025-12-31' },
      ];
      Goal.find.mockResolvedValue(goals);

      const res = await request(app)
        .get('/goals');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(goals);
    });

    it('should return 404 if no goals are found', async () => {
      Goal.find.mockResolvedValue([]);

      const res = await request(app)
        .get('/goals');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No goals found for this user' });
    });

    it('should return 500 if there is a server error', async () => {
      Goal.find.mockRejectedValue(new Error('Server Error'));

      const res = await request(app)
        .get('/goals');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
    });
  });

  describe('updateGoalProgress', () => {
    it('should update the goal progress', async () => {
      const goal = { _id: 'goalId', user: 'userId', goalName: 'Goal', goalAmount: 1000, currentAmount: 500, isCompleted: false };
      const updatedGoal = { ...goal, currentAmount: 600 };
      Goal.findById.mockResolvedValue(goal);
      goal.save = jest.fn().mockResolvedValue(updatedGoal);

      const res = await request(app)
        .put('/goals/progress')
        .send({ goalId: 'goalId', amountSaved: 100 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedGoal);
    });

    it('should return 404 if goal is not found or unauthorized', async () => {
      Goal.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/goals/progress')
        .send({ goalId: 'goalId', amountSaved: 100 });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Goal not found or unauthorized' });
    });

    it('should return 500 if there is a server error', async () => {
      Goal.findById.mockRejectedValue(new Error('Server Error'));

      const res = await request(app)
        .put('/goals/progress')
        .send({ goalId: 'goalId', amountSaved: 100 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      const goal = { _id: 'goalId', user: 'userId', goalName: 'Goal', goalAmount: 1000 };
      Goal.findById.mockResolvedValue(goal);
      Goal.findByIdAndDelete.mockResolvedValue();

      const res = await request(app)
        .delete('/goals/goalId');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Goal deleted successfully' });
    });

    it('should return 404 if goal is not found or unauthorized', async () => {
      Goal.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete('/goals/goalId');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Goal not found or unauthorized' });
    });

    it('should return 500 if there is a server error', async () => {
      Goal.findById.mockRejectedValue(new Error('Server Error'));

      const res = await request(app)
        .delete('/goals/goalId');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server Error', error: 'Server Error' });
    });
  });
});