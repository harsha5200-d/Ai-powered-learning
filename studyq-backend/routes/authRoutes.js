const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse, validateEmail, validatePassword } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
};

router.post('/register', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    // Validation
    const errors = {};
    if (!username || username.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }
    if (!validateEmail(email)) {
      errors.email = "Invalid email address.";
    }
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      errors.password = pwdCheck.msg;
    }

    if (Object.keys(errors).length > 0) {
      return errorResponse(res, "Validation failed.", 422, errors);
    }

    // Uniqueness check
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return errorResponse(res, "Email already registered.", 409);
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return errorResponse(res, "Username already taken.", 409);
    }

    const user = new User({ username, email });
    await user.setPassword(password);
    await user.save();

    const token = generateToken(user._id);
    return successResponse(res, { user: user.toDict(), token }, "Registration successful.", 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error during registration.", 500);
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return errorResponse(res, "Email and password are required.", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const token = generateToken(user._id);
    return successResponse(res, { user: user.toDict(), token }, "Login successful.", 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error during login.", 500);
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, "User not found.", 404);
    }
    return successResponse(res, user.toDict());
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error.", 500);
  }
});

module.exports = router;
