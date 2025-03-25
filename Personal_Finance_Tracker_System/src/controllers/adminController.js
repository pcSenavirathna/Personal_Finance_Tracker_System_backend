const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");
const User = require("../models/userModel");


// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create a new user (Admin only)
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ name, email, password, role });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update user details (Admin only)
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Transactions (Admin Access)
const getAllTransactions = async (req, res) => {
	try {
	  const transactions = await Transaction.find().populate("user", "name email");
	  res.status(200).json(transactions);
	} catch (error) {
	  res.status(500).json({ message: "Server Error", error: error.message });
	}
  };

  // Get All Budgets (Admin Access)
const getAllBudgets = async (req, res) => {
	try {
	  const budgets = await Budget.find().populate("user", "name email");
	  res.status(200).json(budgets);
	} catch (error) {
	  res.status(500).json({ message: "Server Error", error: error.message });
	}
  };

  // Configure System Settings (Categories, Limits)
const configureSettings = async (req, res) => {
	try {

	  const { categories, globalLimit } = req.body;

	  res.status(200).json({ message: "Settings updated", categories, globalLimit });
	} catch (error) {
	  res.status(500).json({ message: "Server Error", error: error.message });
	}
  };

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllTransactions,
  getAllBudgets,
  configureSettings
};
