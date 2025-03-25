const User = require("../models/userModel");
const bcrypt = require("bcryptjs");


// View User Profile
const getUserProfile = async (req, res) => {
	try {
	  const user = await User.findById(req.user.id).select("-password"); // Exclude password
  
	  if (!user) {
		return res.status(404).json({ message: "User not found" });
	  }
  
	  res.status(200).json(user);
	} catch (error) {
	  res.status(500).json({ message: "Server Error", error: error.message });
	}
  };
  
  // Update User Profile
  const updateUserProfile = async (req, res) => {
	try {
	  const user = await User.findById(req.user.id);
  
	  if (!user) {
		return res.status(404).json({ message: "User not found" });
	  }
  
	  // Update fields if provided
	  if (req.body.name) user.name = req.body.name;
	  if (req.body.email) user.email = req.body.email;
  
	  // Update password if provided
	  if (req.body.password) {
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(req.body.password, salt);
	  }
  
	  const updatedUser = await user.save();
	  res.status(200).json({ 
		_id: updatedUser._id,
		name: updatedUser.name,
		email: updatedUser.email,
		role: updatedUser.role,
		message: "Profile updated successfully"
	  });
	} catch (error) {
	  res.status(500).json({ message: "Server Error", error: error.message });
	}
  };

module.exports = {
  getUserProfile,
  updateUserProfile,
};
