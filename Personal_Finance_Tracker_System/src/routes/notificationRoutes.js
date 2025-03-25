const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { notifyUserAboutSpending, notifyUserAboutUpcomingPayments, notifyUserAboutFinancialGoal } = require("../controllers/notificationController");

const router = express.Router();

/**
 * @swagger
 * /api/user/notify/spending:
 *   post:
 *     summary: Notify user about spending
 *     description: Send a notification to the user when they exceed their budget limit.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - category
 *               - amountSpent
 *               - limit
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "603b8f50f6b3d2014c1c9f1e"
 *               category:
 *                 type: string
 *                 example: "Food"
 *               amountSpent:
 *                 type: number
 *                 example: 550
 *               limit:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Notification sent
 */
router.post("/spending", notifyUserAboutSpending);

/**
 * @swagger
 * /api/user/notify/payments:
 *   post:
 *     summary: Notify user about upcoming payments
 *     description: Send a reminder to the user for upcoming bill payments.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *               - category
 *               - dueDate
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "603b8f50f6b3d2014c1c9f1e"
 *               amount:
 *                 type: number
 *                 example: 100
 *               category:
 *                 type: string
 *                 example: "Rent"
 *               dueDate:
 *                 type: string
 *                 example: "2025-03-15"
 *     responses:
 *       200:
 *         description: Reminder sent
 */
router.post("/payments", protect, adminOnly, notifyUserAboutUpcomingPayments);

/**
 * @swagger
 * /api/user/notify/goals:
 *   post:
 *     summary: Notify user about financial goal progress
 *     description: Send a reminder to the user for progress towards their financial goals.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - goalAmount
 *               - currentAmount
 *               - goalDescription
 *               - targetDate
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "603b8f50f6b3d2014c1c9f1e"
 *               goalAmount:
 *                 type: number
 *                 example: 5000
 *               currentAmount:
 *                 type: number
 *                 example: 2000
 *               goalDescription:
 *                 type: string
 *                 example: "Save for a new car"
 *               targetDate:
 *                 type: string
 *                 example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Goal progress reminder sent
 */
router.post("/goals", protect, adminOnly, notifyUserAboutFinancialGoal);

module.exports = router;
