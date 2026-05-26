const express = require('express');
const { getSummary, getHistory, getTrends } = require('../services/analyticsService');
const { successResponse, errorResponse } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const summary = await getSummary(req.user.id);
    return successResponse(res, summary);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error fetching summary.", 500);
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await getHistory(req.user.id);
    return successResponse(res, history);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error fetching history.", 500);
  }
});

router.get('/trends', authMiddleware, async (req, res) => {
  try {
    const trends = await getTrends(req.user.id);
    return successResponse(res, trends);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Server error fetching trends.", 500);
  }
});

module.exports = router;
