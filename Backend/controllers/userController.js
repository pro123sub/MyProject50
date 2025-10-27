// controllers/userController.js
const asyncHandler = require('express-async-handler');
const userService = require('../services/userServices');
const logger = require('../utils/logger');

// ✅ Basic Registration
const registerUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await userService.registerUser(userId, req.body);

  res.status(200).json({
    message: "Registration completed successfully.",
    user: result.user,
  });
});

// ✅ Get Profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.json({ message: 'Profile fetched successfully.', user });
});

// ✅ Login via Phone + DOB → Send OTP
const loginUser = asyncHandler(async (req, res) => {
  const { phone, dob } = req.body;

  logger.info(`[USER CONTROLLER] Login attempt for phone: ${phone}`);

  const result = await userService.loginViaPhoneAndDob(phone, dob);

  res.status(200).json({
    message: result.message, // "OTP sent for login. Please verify to continue."
    phone: result.phone
  });
});

module.exports = {
  registerUser,
  getProfile,
  loginUser
};
