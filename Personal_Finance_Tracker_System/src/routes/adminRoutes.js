const express = require("express");
const User = require("../models/userModel");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getAllTransactions, getAllBudgets, configureSettings, } = require("../controllers/adminController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only user management endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Admins can view all registered users.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Access Denied. Admins only.
 */
router.get("/users", protect, adminOnly, getAllUsers);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     description: Admins can fetch a single user by ID.
 *     tags: [Admin]
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
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get("/users/:id", protect, adminOnly, getUserById);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     description: Admins can create new users.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["user", "admin"]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 */
router.post("/users", protect, adminOnly, createUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     description: Admins can update user details.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["user", "admin"]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/users/:id", protect, adminOnly, updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     description: Admins can delete users.
 *     tags: [Admin]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", protect, adminOnly, deleteUser);

// /**
//  * @swagger
//  * /api/admin/transactions:
//  *   get:
//  *     summary: Get all transactions (Admin)
//  *     description: Admins can view all transactions from all users.
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of all transactions
//  */
// router.get("/transactions", protect, adminOnly, getAllTransactions);

// /**
//  * @swagger
//  * /api/admin/budgets:
//  *   get:
//  *     summary: Get all budgets (Admin)
//  *     description: Admins can view all user budgets.
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of all budgets
//  */
// router.get("/budgets", protect, adminOnly, getAllBudgets);

// /**
//  * @swagger
//  * /api/admin/settings:
//  *   post:
//  *     summary: Configure system settings (Admin)
//  *     description: Admins can update system-wide settings, such as categories and global budget limits.
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               categories:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                 example: ["Food", "Transport", "Entertainment"]
//  *               globalLimit:
//  *                 type: number
//  *                 example: 10000
//  *     responses:
//  *       200:
//  *         description: Settings updated successfully
//  */
// router.post("/settings", protect, configureSettings);

module.exports = router;
