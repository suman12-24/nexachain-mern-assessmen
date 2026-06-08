const Investment = require('../models/Investment');
const { distributeReferralIncome } = require('../services/referralService');

/**
 * Investment plans.
 * Silver minimum is ₹100 so small amounts like ₹500 are accepted.
 */
const PLANS = {
  silver:  { name: 'Silver Plan',  durationDays: 30, minAmount: 100,   maxAmount: 9999,   dailyRoi: 1.0 },
  gold:    { name: 'Gold Plan',    durationDays: 60, minAmount: 10000, maxAmount: 49999,  dailyRoi: 1.5 },
  diamond: { name: 'Diamond Plan', durationDays: 90, minAmount: 50000, maxAmount: 999999, dailyRoi: 2.0 },
};

/**
 * POST /api/investments
 * Body: { planKey, amount }
 * endDate is computed here before create() so Mongoose validation never sees a missing value.
 */
exports.createInvestment = async (req, res) => {
  try {
    const { planKey, amount } = req.body;
    const plan = PLANS[planKey?.toLowerCase()];

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan. Choose from: ${Object.keys(PLANS).join(', ')}`,
      });
    }

    const amt = Number(amount);
    if (!amt || amt < plan.minAmount || amt > plan.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between ₹${plan.minAmount.toLocaleString('en-IN')} and ₹${
          plan.maxAmount < 999999 ? plan.maxAmount.toLocaleString('en-IN') : 'unlimited'
        } for ${plan.name}`,
      });
    }

    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const investment = await Investment.create({
      user: req.user._id,
      amount: amt,
      planDetails: {
        name: plan.name,
        durationDays: plan.durationDays,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
      },
      dailyRoiPercentage: plan.dailyRoi,
      startDate,
      endDate,
    });

    // Distribute level income up the referral chain
    await distributeReferralIncome(req.user._id, investment._id, amt);

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      investment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/investments
 * Query: ?status=active|completed|cancelled&page=1&limit=10
 */
exports.getUserInvestments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Investment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      investments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/investments/plans */
exports.getPlans = (_req, res) => {
  res.json({ success: true, plans: PLANS });
};
