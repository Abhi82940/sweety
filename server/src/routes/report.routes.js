const express = require('express');
const authenticate = require('../middleware/auth');
const {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport
} = require('../controllers/report.controller');

const router = express.Router();

router.use(authenticate);

router.get('/daily', getDailyReport);
router.get('/month-to-date', getMonthToDateReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;
