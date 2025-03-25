const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");
const { route } = require("./authRoutes");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: User personal reports and profile management
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: View user profile
 *     description: Users can view their profile details.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 */
router.get("/profile", protect, getUserProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Users can update their profile details.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/profile", protect, updateUserProfile);


module.exports = router;
