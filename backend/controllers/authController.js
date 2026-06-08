const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateIndianMobile, validatePassword } = require('../utils/validators');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { fullName, email, mobile, password, referralCode } = req.body;

    // ── Required field checks ────────────────────────────────────────────────
    if (!fullName?.trim()) return res.status(400).json({ success: false, message: 'Full name is required' });
    if (!email?.trim())    return res.status(400).json({ success: false, message: 'Email is required' });

    // ── Indian mobile validation ─────────────────────────────────────────────
    const mobileCheck = validateIndianMobile(mobile);
    if (!mobileCheck.valid) return res.status(400).json({ success: false, message: mobileCheck.message });

    // ── Strong password validation ────────────────────────────────────────────
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return res.status(400).json({ success: false, message: passwordCheck.message });

    // ── Uniqueness check ─────────────────────────────────────────────────────
    // Normalise mobile to 10-digit form before storing
    const normalMobile = mobile.trim().replace(/\s+/g, '').replace(/^(?:\+91|91|0)/, '');

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile: normalMobile }] });
    if (exists) {
      const field = exists.email === email.toLowerCase() ? 'Email' : 'Mobile number';
      return res.status(409).json({ success: false, message: `${field} is already registered` });
    }

    // ── Referral resolution ──────────────────────────────────────────────────
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (!referrer) return res.status(400).json({ success: false, message: 'Invalid referral code' });
      referredBy = referrer._id;
    }

    const user = await User.create({ fullName: fullName.trim(), email, mobile: normalMobile, password, referredBy });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, referralCode: user.referralCode, walletBalance: user.walletBalance },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (user.accountStatus !== 'active')
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });

    const token = signToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, referralCode: user.referralCode, walletBalance: user.walletBalance, totalRoiEarned: user.totalRoiEarned, totalLevelIncomeEarned: user.totalLevelIncomeEarned },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
