const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	type: {
		type: String,
		enum: ["income", "expense"],
		required: true
	},
	category: {
		type: String,
		required: true
	},
	amount: {
		type: Number,
		required: true
	},
	currency: {
		type: String,
		required: true,
		default: "USD"
	},
	description: {
		type: String
	},
	tags: {
		type: [String]
	},
	isRecurring: {
		type: Boolean,
		default: false
	},
	recurrencePattern: {
		type: String,
		enum: ["daily", "weekly", "monthly"]
	},
	endDate: {
		type: Date
	},
	createdAt: {
	  type: Date,
	  default: Date.now
  }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
