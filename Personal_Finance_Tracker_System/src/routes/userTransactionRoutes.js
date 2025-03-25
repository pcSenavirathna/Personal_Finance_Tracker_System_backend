const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { addTransaction, getTransactions, updateTransaction, deleteTransaction, generateReport } = require("../controllers/userTransactionController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Transactions
 *   description: User expense and income management
 */

/**
 * @swagger
 * /api/user/transactions:
 *   post:
 *     summary: Add a transaction
 *     description: Users can add income or expense transactions, including recurring transactions. The system will notify the user if they are nearing or exceeding their budget.
 *     tags: [User Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - category
 *               - amount
 *               - currency
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ["income", "expense"]
 *                 example: "expense"
 *               category:
 *                 type: string
 *                 example: "Food"
 *               amount:
 *                 type: number
 *                 example: 50
 *               currency:
 *                 type: string
 *                 example: "USD"
 *               description:
 *                 type: string
 *                 example: "Lunch at a restaurant"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["#food", "#lunch"]
 *               isRecurring:
 *                 type: boolean
 *                 example: true
 *               recurrencePattern:
 *                 type: string
 *                 enum: ["daily", "weekly", "monthly"]
 *                 example: "monthly"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *     responses:
 *       201:
 *         description: Transaction added successfully and budget notification sent if applicable
 */
router.post("/", protect, addTransaction);

/**
 * @swagger
 * /api/user/transactions:
 *   get:
 *     summary: View all transactions with filters
 *     description: Users can view transactions, filter by category, tag, and sort by amount.
 *     tags: [User Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: sortByAmount
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *         description: Sort by amount (ascending or descending)
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/", protect, getTransactions);

/**
 * @swagger
 * /api/user/transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     description: Users can update a transaction's details.
 *     tags: [User Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isRecurring:
 *                 type: boolean
 *               recurrencePattern:
 *                 type: string
 *                 enum: ["daily", "weekly", "monthly"]
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 */
router.put("/:id", protect, updateTransaction);

/**
 * @swagger
 * /api/user/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     description: Users can delete a transaction.
 *     tags: [User Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 */
router.delete("/:id", protect, deleteTransaction);

/**
 * @swagger
 * /api/user/transactions/reports:
 *   get:
 *     summary: Generate financial report with filters
 *     description: Users can view a summary of their transactions, filtered by category and tags. The report will be generated in the user's preferred currency or a selected currency.
 *     tags: [User Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Currency for the report
 *     responses:
 *       200:
 *         description: Report generated successfully
 */
router.get("/reports", protect, generateReport);

module.exports = router;
