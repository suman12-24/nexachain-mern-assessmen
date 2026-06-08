const mongoose = require('mongoose');

/**
 * ROIHistory Schema
 * One document per investment per day — tracks daily ROI credits.
 * The compound unique index on (investment, date) enforces idempotency
 * so the cron job cannot credit the same day twice.
 */
const roiHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    /** Normalized to midnight UTC so one record per calendar day */
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['credited', 'pending', 'failed'],
      default: 'credited',
    },
  },
  { timestamps: true }
);

// ─── Compound unique index: prevents double-crediting on the same day ─────────
roiHistorySchema.index({ investment: 1, date: 1 }, { unique: true });
roiHistorySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('ROIHistory', roiHistorySchema);
