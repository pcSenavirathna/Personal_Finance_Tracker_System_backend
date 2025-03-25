const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  user: { 
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	category: {
		type: String,
		required: true,
		enum: ["Food", "Transportation", "Housing", "Utilities", "Insurance", "Healthcare", "Saving", "Investment", "Entertainment", "Miscellaneous", "other"]
	},
	limit: {
		type: Number,
		required: true
	},
	currency: {
		type: String,
	  required: true,
	  default: "USD"
	},
	month: {
		type: String,
		required: true
	},
	year: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
	  default: Date.now
  }
});

// Add a compound unique index to ensure no duplicate category/month/year/user combination
BudgetSchema.index({ category: 1, month: 1, year: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Budget", BudgetSchema);
