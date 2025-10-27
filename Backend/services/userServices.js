// services/userService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { hashPassword } = require('../utils/hash');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../GlobalExceptionHandler/exception');
const twilioOtp = require('../utils/twilioOtp');

/**
 * =====================================
 * Basic Registration (After OTP Verify)
 * =====================================
 */
async function registerUser(userId, data) {
  logger.info(`📌 [USER SERVICE] Starting registration for userId: ${userId}`);

  // 1️⃣ Fetch user by ID
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!user) {
    logger.error(`❌ [USER SERVICE] User not found for ID: ${userId}`);
    throw new NotFoundError('User not found.');
  }

  if (!user.phoneVerified) {
    logger.warn(`⚠️ [USER SERVICE] Phone not verified for userId: ${userId}`);
    throw new BadRequestError('Phone must be verified before registration.');
  }

  const { name, dob, gender, email, password } = data;

  // 2️⃣ Validate required fields
  if (!name || !dob || !gender || !password) {
    logger.error('❌ [USER SERVICE] Missing required fields for registration');
    throw new BadRequestError('name, dob, gender & password are required.');
  }

  // 3️⃣ Validate email uniqueness if updated
  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      logger.error(`❌ [USER SERVICE] Email already registered: ${email}`);
      throw new BadRequestError('Email already registered.');
    }
  }

  // 4️⃣ Prepare update object
  const updateData = {
    name,
    dob: new Date(dob),
    gender: gender.toUpperCase(),
    email,
    password: await hashPassword(password),
  };

  // 5️⃣ Update user in DB
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  logger.info(`✅ [USER SERVICE] Registration completed for customUserId: ${updatedUser.customUserId}`);

  // 6️⃣ Return minimal user info
  return {
    message: 'Registration completed successfully.',
    user: {
      id: updatedUser.customUserId,
      phone: updatedUser.phone,
      name: updatedUser.name,
      email: updatedUser.email,
      dob: updatedUser.dob,
      gender: updatedUser.gender,
    },
  };
}
/**
 * ==============================
 * Login with Phone + DOB + OTP
 * ==============================
 */
async function loginViaPhoneAndDob(phone, dob) {
  logger.info(`📌 [USER SERVICE] Login attempt via phone & DOB: ${phone}`);

  if (!phone || !dob) {
    throw new BadRequestError("Phone and Date of Birth are required.");
  }

  // Convert DOB format
  const formattedDob = new Date(dob).toISOString().split("T")[0]; // YYYY-MM-DD only

  // ✅ Find user with same phone & DOB
  const user = await prisma.user.findFirst({
    where: {
      phone,
      dob: new Date(formattedDob)
    }
  });

  if (!user) {
    logger.warn(`❌ Login failed: No user matched phone + dob for phone: ${phone}`);
    throw new UnauthorizedError("User not found or credentials incorrect.");
  }

  if (!user.phoneVerified) {
    throw new BadRequestError("Phone not verified! Please verify phone OTP first.");
  }

  // ✅ Send OTP for login
  await twilioOtp.sendOtp(phone);
  logger.info(`✅ OTP sent for login to ${phone}`);

  return {
    message: "OTP sent for login. Please verify to continue.",
    phone
  };
}

/**
 * ==============================
 * Fetch Profile /me
 * ==============================
 */
async function getProfile(userId) {
  logger.info(`📌 [USER SERVICE] Fetching profile for userId: ${userId}`);

  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!user) {
    logger.error(`❌ [USER SERVICE] User not found for ID: ${userId}`);
    throw new NotFoundError('User not found.');
  }

  logger.info(`✅ [USER SERVICE] Profile fetched successfully for userId: ${userId}`);
  return user;
}

module.exports = {
  registerUser,
  getProfile,
  loginViaPhoneAndDob
};
