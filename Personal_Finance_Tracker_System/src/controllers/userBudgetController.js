const Budget = require("../models/budgetModel");
const Transaction = require("../models/transactionModel");
const { sendEmailNotification } = require("../utils/emailSender");
const User = require("../models/userModel");

// Set a Monthly Budget or Category-Specific Budget
const setBudget = async (req, res) => {
  const { category, limit, month, year } = req.body;
  const allowedCategories = [
    "Food", "Transportation", "Housing", "Utilities", "Insurance",
    "Healthcare", "Saving", "Investment", "Entertainment", "Miscellaneous", "Other"
  ];

  try {
    // Check if the provided category is valid
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Allowed categories: ${allowedCategories.join(", ")}` });
    }

    // Check if the user is trying to set a budget for the same category/month/year combination
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      month,
      year
    });

    if (existingBudget) {
      return res.status(400).json({ message: `Budget already exists for ${category} in ${month} ${year}` });
    }

    // Create the new budget
    const newBudget = await Budget.create({
      user: req.user.id,
      category,
      limit,
      month,
      year,
    });

    await analyzeSpendingAndRecommend(req.user.id, category, limit);

    return res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Analyze Spending and Provide Recommendations
const analyzeSpendingAndRecommend = async (userId, category, budgetLimit) => {
  try {
    // Log the userId to ensure it's being passed correctly
    console.log("Analyzing spending for userId:", userId);

    // Calculate total spending for the given category
    const totalSpent = await Transaction.aggregate([
      { $match: { user: userId, category: category } },
      { $group: { _id: "$category", totalSpent: { $sum: "$amount" } } }
    ]);

    const spentAmount = totalSpent[0] ? totalSpent[0].totalSpent : 0;
    const remainingAmount = budgetLimit - spentAmount;
    const spentPercentage = (spentAmount / budgetLimit) * 100;

    let recommendationMessage = "";

    if (spentPercentage >= 100) {
      recommendationMessage = `You have exceeded your budget for ${category} by ${spentAmount - budgetLimit}. Please consider reducing your spending in this category or adjusting your budget.`;
    } else if (spentPercentage >= 80) {
      recommendationMessage = `You have spent ${spentPercentage}% of your budget for ${category}. Consider reviewing your spending to avoid exceeding your budget.`;
    } else if (spentPercentage > 30 && spentPercentage < 50) {
      recommendationMessage = `You have spent only ${spentPercentage}% of your budget for ${category}. You're on track to stay within your budget. Keep up the good work!`;
    }

    // Send recommendation email to the user
    if (recommendationMessage) {
      const user = await User.findById(userId);

      // Check if the user exists
      if (!user) {
        console.error("User not found for ID:", userId);
        return; // Exit if the user is not found
      }

      const email = user.email;
      const userName = user.name;

      const subject = `Budget Update and Recommendations for ${category}`;
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="text-align: center;">
              <!-- Logo Image -->
              <img src="https://img.freepik.com/free-vector/modern-money-logo-concept_23-2147880106.jpg?t=st=1741270716~exp=1741274316~hmac=5de6590fc44ab9841a6145bb3c736ca4a9124b53d65e8d0bc97ac34cee3a7969&w=900" alt="Logo" style="max-width: 200px; margin-bottom: 20px;"/>
              <h2>Dear ${userName},</h2>
              <p>${recommendationMessage}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Amount Spent:</strong> ${spentAmount}</p>
              <p><strong>Budget Limit:</strong> ${budgetLimit}</p>
              <p><strong>Remaining Budget:</strong> ${remainingAmount}</p>
              <p><strong>Next Steps:</strong> Please review your spending for this category and take the necessary actions.</p>
            </div>
          </body>
        </html>
      `;

      await sendEmailNotification(email, subject, htmlContent);
    }
  } catch (error) {
    console.error("Error analyzing spending and sending recommendation:", error);
  }
};

// Get All Budgets for a User
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    if (!budgets.length) {
      return res.status(404).json({ message: "No budgets found for this user" });
    }

    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update a Budget
const updateBudget = async (req, res) => {
  const { category, limit, month, year } = req.body;

  try {

    // Find the existing budget to update
    const budget = await Budget.findById(req.params.id);

    if (!budget || budget.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Budget not found or unauthorized" });
    }

    // Update the budget with new values
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      { category, limit, month, year },
      { new: true }
    );

    res.status(200).json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a Budget
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget || budget.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Budget not found or unauthorized" });
    }


    await Budget.findByIdAndDelete(req.params.id); 

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  setBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};
