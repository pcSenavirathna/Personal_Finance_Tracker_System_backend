const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./src/config/db");
const setupSwagger = require("./src/config/swagger");

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const userRoutes = require("./src/routes/userRoutes");
const userTransactionRoutes = require("./src/routes/userTransactionRoutes");
const userBudgetRoutes = require("./src/routes/userBudgetRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const userGoalRoutes = require("./src/routes/goalRoutes");




dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Setup Swagger UI
setupSwagger(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user/transactions", userTransactionRoutes);
app.use("/api/user/budgets", userBudgetRoutes);
app.use("/api/user/notify", notificationRoutes);
app.use("/api/user/goals", userGoalRoutes);


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
