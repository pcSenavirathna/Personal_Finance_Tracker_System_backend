const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { setBudget, getBudgets, updateBudget, deleteBudget } = require("../controllers/userBudgetController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Budgets
 *   description: User personal budget management
 */

/**
 * @swagger
 * /api/user/budgets:
 *   post:
 *     summary: Set a budget
 *     description: Users can set a monthly or category-specific budget.
 *     tags: [User Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - limit
 *               - month
 *               - year
 *             properties:
 *               category:
 *                 type: string
 *                 enum: ["Food", "Entertainment", "Bills", "Transportation", "Other"]  # Dropdown options
 *                 example: "Food"  # Default selection in Swagger UI
 *               limit:
 *                 type: number
 *                 example: 5000
 *               month:
 *                 type: string
 *                 example: "March"
 *               year:
 *                 type: string
 *                 example: "2025"
 *     responses:
 *       201:
 *         description: Budget set successfully
 *       400:
 *         description: Budget already exists for this category in the specified month/year
 */
router.post("/", protect, setBudget);

/**
 * @swagger
 * /api/user/budgets:
 *   get:
 *     summary: Get budgets
 *     description: Users can view their budget limits.
 *     tags: [User Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 */
router.get("/", protect, getBudgets);

/**
 * @swagger
 * /api/user/budgets/{id}:
 *   put:
 *     summary: Update a budget
 *     description: Users can update their budget limit for a category or month.
 *     tags: [User Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the budget to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: number
 *                 example: 700
 *     responses:
 *       200:
 *         description: Budget updated successfully
 */
router.put("/:id", protect, updateBudget);

/**
 * @swagger
 * /api/user/budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     description: Users can remove a budget.
 *     tags: [User Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 */
router.delete("/:id", protect, deleteBudget);

module.exports = router;
