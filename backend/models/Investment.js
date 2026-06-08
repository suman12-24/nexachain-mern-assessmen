const mongoose = require('mongoose');

/**
 * Investment Schema
 * Represents a user's investment in a plan.
 * Tracks ROI configuration and lifecycle status.
 */

const planDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },       // e.g. "Gold Plan"
    durationDays: { type: Number, required: true }, // e.g. 30
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
  },
  { _id: false }
);

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [1, 'Investment amount must be positive'],
    },
    planDetails: {
      type: planDetailsSchema,
      required: true,
    },
    dailyRoiPercentage: {
      type: Number,
      required: [true, 'Daily ROI percentage is required'],
      min: [0, 'Daily ROI cannot be negative'],
      max: [100, 'Daily ROI cannot exceed 100%'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: false, // Set explicitly in the controller before creation
    },
    totalRoiPaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
investmentSchema.index({ user: 1, status: 1 });
investmentSchema.index({ status: 1, endDate: 1 }); // For cron: find active investments past end date

// ─── Pre-save: auto-compute endDate from plan duration ───────────────────────
investmentSchema.pre('save', function (next) {
  if (this.isNew && this.planDetails?.durationDays) {
    const end = new Date(this.startDate || Date.now());
    end.setDate(end.getDate() + this.planDetails.durationDays);
    this.endDate = end;
  }
  next();
});

// ─── Virtual: expected total ROI ─────────────────────────────────────────────
investmentSchema.virtual('expectedTotalRoi').get(function () {
  return (this.amount * this.dailyRoiPercentage * this.planDetails?.durationDays) / 100;
});

module.exports = mongoose.model('Investment', investmentSchema);
