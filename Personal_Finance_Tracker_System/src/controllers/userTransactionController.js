const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const { sendEmailNotification } = require("../utils/emailSender");
const Budget = require("../models/budgetModel");
const Goal = require("../models/goalModel");
const { convertCurrency } = require("../utils/currencyConverter");

// Add a Transaction (Income or Expense)
const addTransaction = async (req, res) => {
  const { type, category, amount, description, tags, isRecurring, recurrencePattern, endDate, currency } = req.body;

  try {
    const user = await User.findById(req.user.id);
    let transactionAmount = amount;

    // Convert the transaction amount to the user's preferred currency if necessary
    if (currency !== user.preferredCurrency) {
      transactionAmount = await convertCurrency(amount, currency, user.preferredCurrency);
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      category,
      amount: transactionAmount,
      description,
      tags,
      isRecurring,
      recurrencePattern,
      endDate,
      currency
    });

    if (isRecurring) {
      await handleRecurringTransaction(transaction);
    }

    if (type === "income") {
      await handleIncomeTransaction(transaction);
    } else if (type === "expense") {
      await handleExpenseTransaction(transaction);
    }

    await checkAndNotifyAboutBudget(transaction);

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const checkAndNotifyAboutBudget = async (transaction) => {
  const { category, amount, user, currency } = transaction;

  try {
    // Find the user's budget for the given category
    const userBudget = await Budget.findOne({ user, category });

    if (!userBudget) {
      return; // No budget set for the given category
    }

    // Calculate the percentage of the budget spent
    const budgetLimit = userBudget.limit;
    const amountSpent = await Transaction.aggregate([
      { $match: { user: user, category: category } },
      { $group: { _id: "$category", totalSpent: { $sum: "$amount" } } }
    ]);

    const totalSpent = amountSpent[0] ? amountSpent[0].totalSpent : 0;
    const remainingBudget = budgetLimit - totalSpent;

    if (remainingBudget <= 0) {
      // Exceeded the budget
      await sendBudgetNotification(user, category, totalSpent, budgetLimit, currency);
    } else if (remainingBudget <= budgetLimit * 0.2) {
      // 80% or more of the budget has been spent
      await sendBudgetNotification(user, category, totalSpent, budgetLimit, currency);
    }
  } catch (error) {
    console.error("Error checking budget and sending notification:", error);
  }
};

const handleIncomeTransaction = async (transaction) => {
  if (transaction.type === "income") {
    try {
      const userBudget = await Budget.findOne({
        user: transaction.user,
        category: transaction.category,
      });


      if (userBudget) {
        userBudget.limit += transaction.amount;
        await userBudget.save();
        console.log(`Income of ${transaction.amount} added to category: ${transaction.category}`);
      } else {
        console.log("No budget set for this category");
      }

      const savingsPercentage = 0.10;
      const amountSaved = transaction.amount * savingsPercentage;


      const goal = await Goal.findOne({
        user: transaction.user,
        goalName: "Save for a Car",
      });


      if (goal) {
        goal.currentAmount += amountSaved;

        if (goal.currentAmount >= goal.goalAmount) {
          goal.isCompleted = true;
        }


        await goal.save();
        console.log(`Saved ${amountSaved} towards your goal: ${goal.goalName}`);
      } else {
        console.log("No goal found for this user.");
      }

    } catch (error) {
      console.error("Error handling income transaction:", error);
    }
  }

};

const handleExpenseTransaction = async (transaction) => {
  const { user, category, amount } = transaction;

  try {
    const userBudget = await Budget.findOne({ user, category });

    if (userBudget) {
      userBudget.limit -= amount;
      await userBudget.save();
    }
  } catch (error) {
    console.error("Error updating budget after expense transaction:", error);
  }
};

// Send Email Notification
const sendBudgetNotification = async (userId, category, totalSpent, budgetLimit, currency) => {
  const user = await User.findById(userId);
  const email = user.email;
  const userName = user.name;

  const subject = `Budget Alert: ${category} - You are nearing or exceeding your budget`;

  const htmlContent = `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="text-align: center;">
        <!-- Logo Image -->
        <img src="https://img.freepik.com/free-vector/modern-money-logo-concept_23-2147880106.jpg?t=st=1741270716~exp=1741274316~hmac=5de6590fc44ab9841a6145bb3c736ca4a9124b53d65e8d0bc97ac34cee3a7969&w=900" alt="Logo" style="max-width: 200px; margin-bottom: 20px;"/>

        <h2>Dear ${userName},</h2>
        <p>As a reminder, you are nearing or exceeding your budget for <strong>${category}</strong>.</p>
        <p>You have spent a total of <strong>${totalSpent} ${currency}</strong> out of your <strong>${budgetLimit} ${currency}</strong> budget for this category.</p>

        <p>We recommend reviewing your spending.</p>

        <p><strong>Transaction details:</strong></p>
        <ul>
          <li><strong>Category:</strong> ${category}</li>
          <li><strong>Total Spent:</strong> ${totalSpent} ${currency}</li>
          <li><strong>Budget Limit:</strong> ${budgetLimit} ${currency}</li>
        </ul>
      </div>
    </body>
  </html>
  `;

  await sendEmailNotification(email, subject, htmlContent);
};

// Handle Recurring Transactions
const handleRecurringTransaction = async (transaction) => {
  const { recurrencePattern, endDate, user, amount, category, description, tags, currency } = transaction;

  let nextTransactionDate = new Date();
  let isTransactionDue = false;

  // Define recurrence logic based on recurrencePattern
  if (recurrencePattern === "daily") {
    nextTransactionDate.setDate(nextTransactionDate.getDate() + 1);
    isTransactionDue = true;
  } else if (recurrencePattern === "weekly") {
    nextTransactionDate.setDate(nextTransactionDate.getDate() + 7);
    isTransactionDue = true;
  } else if (recurrencePattern === "monthly") {
    nextTransactionDate.setMonth(nextTransactionDate.getMonth() + 1);
    isTransactionDue = true;
  }

  // If a transaction is due and the end date hasn't passed, create the next transaction
  if (isTransactionDue && new Date(nextTransactionDate) <= new Date(endDate)) {
    await Transaction.create({
      user,
      type: transaction.type,
      category,
      amount,
      description,
      tags,
      isRecurring: true,
      recurrencePattern,
      endDate,
      currency
    });

    // Send notification about the recurring transaction
    const userData = await User.findById(user);
    const email = userData.email;
    const userName = userData.name;

    const subject = `Upcoming Recurring Transaction: ${category}`;

    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <!-- Logo Image -->
          <img src="https://img.freepik.com/free-vector/modern-money-logo-concept_23-2147880106.jpg?t=st=1741270716~exp=1741274316~hmac=5de6590fc44ab9841a6145bb3c736ca4a9124b53d65e8d0bc97ac34cee3a7969&w=900" alt="Logo" style="max-width: 200px; margin-bottom: 20px;"/>

          <h2>Dear ${userName},</h2>
          <p>As requested, this is a reminder that you will be charged for the scheduled payment commitment for your <strong>${category}</strong> transaction.</p>
          <p>You will be charged an amount of <strong>${amount} ${currency}</strong>. Please make sure to check your balance.</p>

          <p>We thank you very much for your continued support.</p>

          <p><strong>Transaction details:</strong></p>
          <ul>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Amount:</strong> ${amount} ${currency}</li>
            <li><strong>Next due date:</strong> ${nextTransactionDate.toLocaleDateString()}</li>
          </ul>
        </div>
      </body>
    </html>
  `;

    await sendEmailNotification(email, subject, htmlContent);
  }
};

//Get All Transactions with Filtering & Sorting
const getTransactions = async (req, res) => {
  try {
    let query = { user: req.user.id };

    // Filter category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter tag
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // Sort (default: most recent first)
    let sort = { date: -1 };
    if (req.query.sortByAmount) {
      sort = { amount: req.query.sortByAmount === "asc" ? 1 : -1 };
    }

    const transactions = await Transaction.find(query).sort(sort);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//Update Transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    await Transaction.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//Generate Financial Report (With Tag and Category-Based Filtering)
const generateReport = async (req, res) => {
  try {
    let query = { user: req.user.id };

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    const transactions = await Transaction.find(query);
    const user = await User.findById(req.user.id);
    const selectedCurrency = req.query.currency || user.preferredCurrency;

    let totalIncome = 0;
    let totalExpenses = 0;
    let categoryWiseSpending = {};
    let categoryWiseBudgets = {};
    let totalBudget = 0;

    for (const transaction of transactions) {
      let amount = transaction.amount;
      if (transaction.currency !== selectedCurrency) {
        amount = await convertCurrency(transaction.amount, transaction.currency, selectedCurrency);
      }

      if (transaction.type === "income") {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
        if (!categoryWiseSpending[transaction.category]) {
          categoryWiseSpending[transaction.category] = 0;
        }
        categoryWiseSpending[transaction.category] += amount;
      }
    }

    const budgets = await Budget.find({ user: req.user.id });
    for (const budget of budgets) {
      let budgetAmount = budget.limit;
      if (budget.currency !== selectedCurrency) {
        budgetAmount = await convertCurrency(budget.limit, budget.currency, selectedCurrency);
      }
      totalBudget += budgetAmount;
      categoryWiseBudgets[budget.category] = budgetAmount;
    }

    res.status(200).json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryWiseSpending,
      totalBudget,
      categoryWiseBudgets,
      currency: selectedCurrency
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  generateReport,
};
