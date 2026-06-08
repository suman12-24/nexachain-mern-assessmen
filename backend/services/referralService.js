const User = require('../models/User');
const ReferralIncome = require('../models/ReferralIncome');

/**
 * Level income percentages (of the investment amount).
 * Level 1 = direct referrer, Level 2 = grandparent, etc.
 */
const LEVEL_PERCENTAGES = { 1: 5, 2: 3, 3: 2, 4: 1, 5: 0.5 };
const MAX_LEVELS = 5;

/**
 * distributeReferralIncome
 * Walks up the referral hierarchy and credits level income to each ancestor.
 * Uses findOneAndUpdate with upsert for idempotency — safe on standalone MongoDB.
 *
 * @param {ObjectId} investorId      - User who made the investment
 * @param {ObjectId} investmentId    - The new investment document
 * @param {Number}   investmentAmount
 */
async function distributeReferralIncome(investorId, investmentId, investmentAmount) {
  let currentUserId = investorId;

  for (let level = 1; level <= MAX_LEVELS; level++) {
    const currentUser = await User.findById(currentUserId).select('referredBy');
    if (!currentUser || !currentUser.referredBy) break;

    const referrerId = currentUser.referredBy;
    const percentage = LEVEL_PERCENTAGES[level];
    const incomeAmount = parseFloat(((investmentAmount * percentage) / 100).toFixed(2));

    // Idempotency: only insert if this exact record doesn't already exist
    const existing = await ReferralIncome.findOne({
      recipient: referrerId,
      generator: investorId,
      investment: investmentId,
      level,
    });

    if (!existing) {
      await ReferralIncome.create({
        recipient: referrerId,
        generator: investorId,
        investment: investmentId,
        level,
        amount: incomeAmount,
      });

      // Credit wallet and total level income
      await User.findByIdAndUpdate(referrerId, {
        $inc: {
          walletBalance: incomeAmount,
          totalLevelIncomeEarned: incomeAmount,
        },
      });
    }

    currentUserId = referrerId;
  }
}

module.exports = { distributeReferralIncome };
