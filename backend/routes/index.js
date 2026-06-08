const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');

const authCtrl   = require('../controllers/authController');
const investCtrl = require('../controllers/investmentController');
const dashCtrl   = require('../controllers/dashboardController');

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login',    authCtrl.login);
router.get ('/auth/me',       protect, authCtrl.getMe);

// ── Investments ───────────────────────────────────────────────────────────────
router.get ('/investments/plans', investCtrl.getPlans);
router.post('/investments',       protect, investCtrl.createInvestment);
router.get ('/investments',       protect, investCtrl.getUserInvestments);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get ('/dashboard',    protect, dashCtrl.getDashboard);
router.get ('/roi-history',  protect, dashCtrl.getRoiHistory);

// ── Dev utility: manually trigger the ROI cron (remove in production) ─────────
router.post('/debug/trigger-roi', protect, dashCtrl.triggerRoiManually);

// ── Referrals ─────────────────────────────────────────────────────────────────
router.get('/referrals/direct', protect, dashCtrl.getDirectReferrals);
router.get('/referrals/tree',   protect, dashCtrl.getReferralTree);
router.get('/referrals/income', protect, dashCtrl.getReferralIncomeHistory);

module.exports = router;
