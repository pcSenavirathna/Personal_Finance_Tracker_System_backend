const Goal = require("../models/goalModel");
const User = require("../models/userModel");
const { sendEmailNotification } = require("../utils/emailSender");

// Create a new financial goal
const createGoal = async (req, res) => {
  const { goalName, goalAmount, targetDate } = req.body;

  try {
    const newGoal = new Goal({
      user: req.user.id,
      goalName,
      goalAmount,
      targetDate,
    });

    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all goals of the user
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });

    if (!goals.length) {
      return res.status(404).json({ message: "No goals found for this user" });
    }

    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update the current progress of a goal
const updateGoalProgress = async (req, res) => {
	const { goalId, amountSaved } = req.body;
  
	try {
	  const goal = await Goal.findById(goalId);
  
	  if (!goal || goal.user.toString() !== req.user.id) {
		return res.status(404).json({ message: "Goal not found or unauthorized" });
	  }
  
	  goal.currentAmount += amountSaved;
  
	  if (goal.currentAmount >= goal.goalAmount) {
		goal.isCompleted = true;
		// Notify user when the goal is completed
		const user = await User.findById(goal.user);
		const email = user.email;
		const userName = user.name;

      const subject = `Congratulations! You have reached your savings goal for ${goal.goalName}`;
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="text-align: center;">
              <!-- Logo Image -->
              <img src="https://img.freepik.com/free-vector/modern-money-logo-concept_23-2147880106.jpg?t=st=1741270716~exp=1741274316~hmac=5de6590fc44ab9841a6145bb3c736ca4a9124b53d65e8d0bc97ac34cee3a7969&w=900" alt="Logo" style="max-width: 200px; margin-bottom: 20px;"/>

              <h2>Dear ${userName},</h2>
              <p>Congratulations! You have successfully reached your savings goal of <strong>${goal.goalAmount}</strong> for <strong>${goal.goalName}</strong>.</p>
              <p>You have saved a total of <strong>${goal.currentAmount}</strong> towards this goal.</p>

              <p><strong>Goal Details:</strong></p>
              <ul>
                <li><strong>Goal Name:</strong> ${goal.goalName}</li>
                <li><strong>Goal Amount:</strong> ${goal.goalAmount}</li>
                <li><strong>Amount Saved:</strong> ${goal.currentAmount}</li>
                <li><strong>Target Date:</strong> ${new Date(goal.targetDate).toLocaleDateString()}</li>
              </ul>

              <p>We are proud of your accomplishment! Keep up the great work and continue saving!</p>
            </div>
          </body>
        </html>
      `;

      await sendEmailNotification(email, subject, htmlContent);
    }
  
	  const updatedGoal = await goal.save();
	  res.status(200).json(updatedGoal);
	} catch (error) {
	  res.status(500).json({ message: "Server Error", error: error.message });
	}
  };
  

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    // Find the goal by ID
    const goal = await Goal.findById(req.params.id);

    // Check if the goal exists and if the user is authorized
    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Goal not found or unauthorized" });
    }

    // Use deleteOne instead of remove
    await Goal.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoalProgress,
  deleteGoal,
};
