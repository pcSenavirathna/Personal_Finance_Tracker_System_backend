# Personal Finance Tracker System

## 📌 Project Description
The **Personal Finance Tracker System** is a web-based application designed to help users manage their personal finances efficiently. It allows users to track expenses, manage budgets, and generate financial reports.

## 🚀 Features
- User authentication (Login/Signup)
- Expense tracking
- Budget management
- Data visualization with reports
- Secure data storage

---

## 📁 Project Structure
```
Personal_Finance_Tracker_System/
│-- config/           # database connect & swagger setup
│-- controllers/      # Business logic and request handling
│-- middlewares/      # Middleware for request
│-- models/           # Database models
│-- routes/           # API routes
├── tests/            # Unit and integration tests
│-- utils/            # Utility functions and configurations
├── .env              # Environment configuration
│-- package.json      # Node.js dependencies
│-- server.js         # Main server entry point
│-- swagger.json      # API documentation
```

---

## 🛠️ Installation & Setup

### 1️⃣ Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (if using a database)
- Git (optional for cloning the repository)


### 3️⃣ Install Dependencies
```sh
npm install
```

### 4️⃣ Configure Environment Variables
Create a `.env` file in the root directory and add necessary configurations:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

EXCHANGE_RATE_API_KEY=your_api_key_here
```

### 5️⃣ Start the Server
```sh
npm start
```
If you are using **nodemon** for automatic restarts, run:
```sh
npm run dev
```

### 6️⃣ Access the Application
- Open your browser and navigate to swagger api: **http://localhost:8000/api-docs/**

---

## 🧪 Running Tests
If your project includes unit tests, you can run them using:
```sh
npm test
```

---

## 📁 API Endpoints (If Applicable)

|             Endpoint             | Method |                          Description                      |
|----------------------------------|--------|-----------------------------------------------------------|
| `/api/auth/register`             | POST   | Register a new user or admin account                      |
| `/api/auth/login`                | POST   | Login a user and retrieve a JWT token                     |
| `/api/admin/users`               | GET    | Admin: Get all users                                      |
| `/api/admin/users/{id}`          | GET    | Admin: Get user by ID                                     |
| `/api/admin/users`               | POST   | Admin: Create a new user                                  |
| `/api/admin/users/{id}`          | PUT    | Admin: Update user details                                |
| `/api/admin/users/{id}`          | DELETE | Admin: Delete user by ID                                  |
| `/api/user/profile`              | GET    | View the current user's profile                           |
| `/api/user/profile`              | PUT    | Update the current user's profile details                 |
| `/api/user/budgets`              | POST   | Set a new budget for a user (monthly/category-specific)   |
| `/api/user/budgets`              | GET    | Get all budgets for a user                                |
| `/api/user/budgets/{id}`         | PUT    | Update an existing budget by ID                           |
| `/api/user/budgets/{id}`         | DELETE | Delete a budget by ID                                     |
| `/api/user/transactions`         | POST   | Add a transaction (income/expense) for the user           |
| `/api/user/transactions`         | GET    | View all transactions of the user with optional filters   |
| `/api/user/transactions/{id}`    | PUT    | Update a transaction by ID                                |
| `/api/user/transactions/{id}`    | DELETE | Delete a transaction by ID                                |
| `/api/user/transactions/reports` | GET    | Generate a financial report based on user's transactions  |
| `/api/user/notify/spending`      | POST   | Notify user about exceeding budget in a specific category |
| `/api/user/notify/payments`      | POST   | Notify user about upcoming bill payments                  |
| `/api/user/notify/goals`         | POST   | Notify user about progress toward a financial goal        |

---

## 🛠️ Technologies Used
- **Node.js** (Backend runtime)
- **Express.js** (Web framework)
- **MongoDB** (Database)
- **JWT** (Authentication)
- **bcryptjs** (Library for hashing passwords)
- **dotenv** (Module for loading environment variables from a .env file)
- **cors** (Middleware for enabling Cross-Origin Resource Sharing)
- **helmet** (Middleware for securing Express apps by setting various HTTP headers)
- **morgan** (HTTP request logger middleware for Node.js)
- **nodemailer** (Module for sending emails)
- **axios** (Promise-based HTTP client for making API requests)
- **swagger-jsdoc** (Library for generating Swagger API documentation)
- **swagger-ui-express** (Middleware for serving Swagger UI)
- **jest** (JavaScript testing framework)
- **supertest** (Library for testing Node.js HTTP servers)
- **nodemon** (Tool for automatically restarting the Node.js application when file changes are detected)
- **OWASP ZAP** (Open Web Application Security Project Zed Attack Proxy, used for automated security testing and vulnerability scanning of web applications)
- **Artillery** (Modern, powerful, and easy-to-use load testing toolkit for API and service performance)
---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-branch`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request
---

## 📩 Contact
For any inquiries, contact:
- **Email**: [Send Email](pcsplustemp@gmail.com)
- **GitHub**: [Github_Profile](https://github.com/pcSenavirathna)
