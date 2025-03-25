const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user or admin account.
 *     tags: [Auth]
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
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: ["user", "admin"]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or passwords do not match
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates user and returns a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "pcsplustemp@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Prasad#01"
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

module.exports = router;
