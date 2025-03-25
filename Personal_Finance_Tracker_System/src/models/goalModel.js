const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  goalName: {
    type: String,
    required: true,
  },
  goalAmount: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Goal", GoalSchema);
