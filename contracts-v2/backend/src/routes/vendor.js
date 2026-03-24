const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { studentPoints, transactions } = require("./codes");
const ledger = require("../blockchain/ledger");

let pendingRequests = {};

// Vendor submits deduction request
router.post("/deduct", auth(["vendor"]), (req, res) => {
  const { srn, points, reason } = req.body;
  const vendorName = req.user.username;

  if (!studentPoints[srn] && studentPoints[srn] !== 0) {
    return res.status(404).json({ error: "Student not found" });
  }
  if ((studentPoints[srn] || 0) < points) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  const requestId = Date.now().toString();
  pendingRequests[requestId] = {
    requestId,
    srn,
    points,
    reason,
    vendorName,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  // Send request to student in real time
  const io = req.app.get("io");
  io.to(srn).emit("vendor_request", pendingRequests[requestId]);

  res.json({ requestId, message: "Request sent to student" });
});

// Student fetches all their requests
router.get("/requests", auth(["student"]), (req, res) => {
  const srn = req.user.srn;
  const myRequests = Object.values(pendingRequests)
    .filter(r => r.srn === srn)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myRequests);
});

// Vendor fetches their session activity history
router.get("/session-requests", auth(["vendor"]), (req, res) => {
  const vendorName = req.user.username;
  const myActivity = Object.values(pendingRequests)
    .filter(r => r.vendorName === vendorName)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myActivity);
});

// Student approves or rejects
router.post("/respond", auth(["student"]), (req, res) => {
  const { requestId, approved } = req.body;
  const srn = req.user.srn;
  const request = pendingRequests[requestId];

  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.srn !== srn) return res.status(403).json({ error: "Not your request" });
  if (request.status !== "pending") return res.status(400).json({ error: "Request already resolved" });

  const io = req.app.get("io");

  if (approved) {
    studentPoints[srn] -= request.points;
    if (!transactions[srn]) transactions[srn] = [];
    transactions[srn].push({
      type: "debit",
      points: request.points,
      reason: request.reason,
      vendor: request.vendorName,
      timestamp: new Date().toISOString(),
    });
    request.status = "approved";
    io.to(request.vendorName).emit("request_approved", {
      requestId,
      newBalance: studentPoints[srn],
    });
    
    // Abstracted blockchain debit
    ledger.recordDebit(srn, request.vendorName, request.points);
  } else {
    request.status = "rejected";
    io.to(request.vendorName).emit("request_rejected", { requestId });
  }

  res.json({ success: true, status: request.status });
});

module.exports = router;