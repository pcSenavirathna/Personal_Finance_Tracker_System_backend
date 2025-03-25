const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { createGoal, getGoals, updateGoalProgress, deleteGoal } = require("../controllers/goalController");


const router = express.Router();

/**
 * @swagger
 * /api/user/goals:
 *   post:
 *     summary: Create a new financial goal
 *     description: Users can create a financial goal.
 *     tags: [User Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goalName
 *               - goalAmount
 *               - targetDate
 *             properties:
 *               goalName:
 *                 type: string
 *                 example: "Save for a Car"
 *               goalAmount:
 *                 type: number
 *                 example: 20000
 *               targetDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *     responses:
 *       201:
 *         description: Goal created successfully
 */
router.post("/", protect, createGoal);

/**
 * @swagger
 * /api/user/goals:
 *   get:
 *     summary: Get all financial goals
 *     description: Users can view their financial goals.
 *     tags: [User Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of goals
 */
router.get("/", protect, getGoals);

/**
 * @swagger
 * /api/user/goals/progress:
 *   put:
 *     summary: Update progress for a financial goal
 *     description: Users can update the current progress for a financial goal.
 *     tags: [User Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goalId
 *               - amountSaved
 *             properties:
 *               goalId:
 *                 type: string
 *                 example: "603b8f50f6b3d2014c1c9f1e"
 *               amountSaved:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Goal progress updated successfully
 */
router.put("/progress", protect, updateGoalProgress);

/**
 * @swagger
 * /api/user/goals/{id}:
 *   delete:
 *     summary: Delete a financial goal
 *     description: Users can delete a financial goal.
 *     tags: [User Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       200:
 *         description: Goal deleted successfully
 */
router.delete("/:id", protect, deleteGoal);

module.exports = router;
