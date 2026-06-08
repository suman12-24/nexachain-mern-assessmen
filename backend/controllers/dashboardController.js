const User = require('../models/User');
const Investment = require('../models/Investment');
const ROIHistory = require('../models/ROIHistory');
const ReferralIncome = require('../models/ReferralIncome');
const { processROIForAllActiveInvestments } = require('../services/roiService');

/**
 * GET /api/dashboard
 * Returns summary stats for the authenticated user.
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, investmentStats, recentRoi, recentReferral] = await Promise.all([
      User.findById(userId).select('walletBalance totalRoiEarned totalLevelIncomeEarned'),

      Investment.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),

      // Populate investment plan name so frontend can display it
      ROIHistory.find({ user: userId })
        .populate('investment', 'planDetails amount dailyRoiPercentage')
        .sort({ date: -1 })
        .limit(7)
        .lean(),

      ReferralIncome.find({ recipient: userId })
        .populate('generator', 'fullName email')
        .sort({ date: -1 })
        .limit(7)
        .lean(),
    ]);

    // Reshape investment stats
    const investmentSummary = { active: 0, completed: 0, cancelled: 0, totalInvested: 0 };
    for (const s of investmentStats) {
      investmentSummary[s._id] = s.count;
      if (s._id === 'active') investmentSummary.totalInvested = s.totalAmount;
    }

    res.json({
      success: true,
      dashboard: {
        walletBalance: user.walletBalance,
        totalRoiEarned: user.totalRoiEarned,
        totalLevelIncomeEarned: user.totalLevelIncomeEarned,
        investments: investmentSummary,
        recentRoi,
        recentReferralIncome: recentReferral,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/debug/trigger-roi   (dev only)
 * Manually runs the ROI cron job — useful for testing without waiting for midnight.
 */
exports.triggerRoiManually = async (req, res) => {
  try {
    const result = await processROIForAllActiveInvestments();
    res.json({ success: true, message: 'ROI processing complete', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/referrals/direct
 */
exports.getDirectReferrals = async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('fullName email mobile createdAt accountStatus walletBalance')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: referrals.length, referrals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/referrals/tree
 * BFS traversal up to 5 levels.
 */
exports.getReferralTree = async (req, res) => {
  try {
    const MAX_LEVELS = 5;

    const tree = { userId: req.user._id, fullName: req.user.fullName, level: 0, children: [] };
    const queue = [{ node: tree, parentId: req.user._id }];

    for (let level = 1; level <= MAX_LEVELS; level++) {
      if (!queue.length) break;
      const currentLevelItems = [...queue];
      queue.length = 0;

      const parentIds = currentLevelItems.map((i) => i.parentId);
      const children = await User.find({ referredBy: { $in: parentIds } })
        .select('_id fullName email referredBy accountStatus')
        .lean();

      for (const child of children) {
        const parentNode = currentLevelItems.find(
          (i) => i.parentId.toString() === child.referredBy.toString()
        );
        if (!parentNode) continue;

        const childNode = {
          userId: child._id,
          fullName: child.fullName,
          email: child.email,
          level,
          accountStatus: child.accountStatus,
          children: [],
        };
        parentNode.node.children.push(childNode);
        queue.push({ node: childNode, parentId: child._id });
      }
    }

    res.json({ success: true, tree });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/roi-history
 * Paginated ROI history for the authenticated user.
 */
exports.getRoiHistory = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const [records, total] = await Promise.all([
      ROIHistory.find({ user: req.user._id })
        .populate('investment', 'planDetails amount dailyRoiPercentage')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      ROIHistory.countDocuments({ user: req.user._id }),
    ]);
    res.json({ success: true, total, page: Number(page), records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/referrals/income
 */
exports.getReferralIncomeHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [records, total] = await Promise.all([
      ReferralIncome.find({ recipient: req.user._id })
        .populate('generator', 'fullName email')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      ReferralIncome.countDocuments({ recipient: req.user._id }),
    ]);
    res.json({ success: true, total, page: Number(page), records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
