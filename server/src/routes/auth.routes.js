const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Rate limiter for auth endpoints: 100 requests per 15 minutes in non-test mode
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 50,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', authenticate, getMe);

module.exports = router;
