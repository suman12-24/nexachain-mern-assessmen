const cron = require('node-cron');
const { processROIForAllActiveInvestments } = require('../services/roiService');

/**
 * Task 5: Cron Job / Scheduler
 * ----------------------------
 * Runs every day at 12:00 AM (midnight) server time.
 * Cron expression: '0 0 * * *'
 *
 * Safety guarantees:
 *  - The ROIHistory unique index (investment + date) prevents double-crediting
 *    even if the job fires twice due to a restart or deployment overlap.
 *  - Each investment is processed in its own session/transaction so one
 *    failure does not roll back others.
 */
function initCronJobs() {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Daily ROI job triggered at', new Date().toISOString());
    try {
      const result = await processROIForAllActiveInvestments();
      console.log('[Cron] Daily ROI job completed:', result);
    } catch (err) {
      console.error('[Cron] Daily ROI job failed:', err.message);
    }
  }, {
    timezone: 'UTC',
  });

  console.log('[Cron] Daily ROI scheduler registered (runs at 00:00 UTC)');
}

module.exports = { initCronJobs };
