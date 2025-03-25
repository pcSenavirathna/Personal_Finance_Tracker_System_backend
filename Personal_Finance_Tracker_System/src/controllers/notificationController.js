const User = require("../models/userModel");
const { sendEmailNotification } = require("../utils/emailSender");

// Notify user about spending
const notifyUserAboutSpending = async (req, res) => {
  const { userId, category, amountSpent, limit } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (amountSpent > limit) {
      const email = user.email;
      const subject = `Spending Alert: ${category}`;
      const text = `You have exceeded your spending limit for ${category}. You spent ${amountSpent}, which is above your limit of ${limit}.`;

      await sendEmailNotification(email, subject, text);
      return res.status(200).json({ message: "Notification sent successfully" });
    } else {
      return res.status(200).json({ message: "Spending is within the limit" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Notify user about upcoming payments
const notifyUserAboutUpcomingPayments = async (req, res) => {
  const { userId, amount, category, dueDate } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const email = user.email;
    const subject = `Upcoming Payment Reminder: ${category}`;
    const text = `You have an upcoming payment of ${amount} for ${category} due on ${dueDate}. Please ensure you have sufficient funds.`;

    await sendEmailNotification(email, subject, text);
    return res.status(200).json({ message: "Reminder sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Notify user about financial goal
const notifyUserAboutFinancialGoal = async (req, res) => {
  const { userId, goalAmount, currentAmount, goalDescription, targetDate } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const goalProgress = (currentAmount / goalAmount) * 100;
    const timeDifference = new Date(targetDate) - new Date();

    if (timeDifference <= 7 * 24 * 60 * 60 * 1000 && timeDifference >= 0) {
      const email = user.email;
      const subject = `Reminder: Financial Goal Progress for ${goalDescription}`;
      const text = `Your financial goal for ${goalDescription} is due on ${targetDate}. You have achieved ${goalProgress.toFixed(2)}% of your target. Current savings: ${currentAmount}.`;

      await sendEmailNotification(email, subject, text);
      return res.status(200).json({ message: "Goal reminder sent successfully" });
    } else {
      return res.status(200).json({ message: "No reminder needed" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { notifyUserAboutSpending, notifyUserAboutUpcomingPayments, notifyUserAboutFinancialGoal };
