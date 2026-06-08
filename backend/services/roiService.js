const Investment = require('../models/Investment');
const ROIHistory = require('../models/ROIHistory');
const User = require('../models/User');

/**
 * Normalize a Date to midnight UTC.
 * Used as the unique key to prevent double-crediting on the same calendar day.
 */
function toMidnightUTC(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * processROIForAllActiveInvestments
 * ---------------------------------------------------------------------------
 * Runs nightly via cron (Task 5). For each active investment:
 *   1. Checks if ROI was already credited today (idempotency via unique index).
 *   2. Inserts ROIHistory record.
 *   3. Credits user wallet + totalRoiEarned.
 *   4. Marks investment completed if past endDate.
 *
 * NOTE: MongoDB transactions removed — works with standalone MongoDB instances.
 * Idempotency is guaranteed by the unique compound index on (investment, date).
 */
async function processROIForAllActiveInvestments() {
  const today = toMidnightUTC();
  const now = new Date();

  console.log(`[ROIService] Starting ROI processing for ${today.toISOString()}`);

  const activeInvestments = await Investment.find({ status: 'active' }).lean();

  let credited = 0;
  let skipped = 0;
  let errors = 0;

  for (const investment of activeInvestments) {
    try {
      // Idempotency check — unique index will also reject duplicates at DB level
      const alreadyCredited = await ROIHistory.findOne({
        investment: investment._id,
        date: today,
      });

      if (alreadyCredited) {
        skipped++;
        continue;
      }

      const roiAmount = parseFloat(
        ((investment.amount * investment.dailyRoiPercentage) / 100).toFixed(2)
      );

      // Insert ROI history record
      await ROIHistory.create({
        user: investment.user,
        investment: investment._id,
        amount: roiAmount,
        date: today,
        status: 'credited',
      });

      // Credit user wallet
      await User.findByIdAndUpdate(investment.user, {
        $inc: { walletBalance: roiAmount, totalRoiEarned: roiAmount },
      });

      // Update cumulative ROI paid on the investment
      await Investment.findByIdAndUpdate(investment._id, {
        $inc: { totalRoiPaid: roiAmount },
      });

      // Auto-complete if past end date
      if (now >= new Date(investment.endDate)) {
        await Investment.findByIdAndUpdate(investment._id, { status: 'completed' });
      }

      credited++;
    } catch (err) {
      // E11000 duplicate key = already credited (race condition), treat as skipped
      if (err.code === 11000) {
        skipped++;
      } else {
        errors++;
        console.error(`[ROIService] Error on investment ${investment._id}:`, err.message);
      }
    }
  }

  console.log(
    `[ROIService] Done — Credited: ${credited}, Skipped: ${skipped}, Errors: ${errors}`
  );
  return { credited, skipped, errors };
}

module.exports = { processROIForAllActiveInvestments, toMidnightUTC };
