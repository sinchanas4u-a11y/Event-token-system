const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { studentPoints, transactions } = require("./codes");

// Get student balance
router.get("/balance", auth(["student"]), (req, res) => {
  const srn = req.user.srn;
  res.json({
    srn,
    balance: studentPoints[srn] || 0,
    transactions: transactions[srn] || [],
  });
});

// Admin checks any student balance
router.get("/balance/:srn", auth(["admin", "vendor"]), (req, res) => {
  const { srn } = req.params;
  res.json({
    srn,
    balance: studentPoints[srn] || 0,
  });
});

module.exports = router;