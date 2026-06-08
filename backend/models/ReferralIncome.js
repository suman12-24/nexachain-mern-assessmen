const mongoose = require('mongoose');

/**
 * ReferralIncome Schema
 * Records each level-income credit event in the referral hierarchy.
 * Level 1 = direct referrer, Level 2 = referrer's referrer, etc.
 */
const referralIncomeSchema = new mongoose.Schema(
  {
    /** User who RECEIVES the income */
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** User whose investment/action TRIGGERED the income */
    generator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Investment that originated the income calculation */
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      default: null,
    },
    /** Level in the referral tree (1 = direct, 2 = grandparent, …) */
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
referralIncomeSchema.index({ recipient: 1, date: -1 });
referralIncomeSchema.index({ generator: 1 });
referralIncomeSchema.index({ investment: 1, recipient: 1, level: 1, date: 1 }); // De-dup index

module.exports = mongoose.model('ReferralIncome', referralIncomeSchema);
