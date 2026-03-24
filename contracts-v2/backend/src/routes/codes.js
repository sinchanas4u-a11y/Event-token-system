const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const crypto = require("crypto");
const ledger = require("../blockchain/ledger");
const { events } = require("./events");

let codes = [];

// Generate unique code
function generateCode(eventId, pointValue) {
  const raw = eventId + "-" + pointValue + "-" + crypto.randomBytes(8).toString("hex");
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 9).toUpperCase();
}

// Admin generates codes for an event
router.post("/generate", auth(["admin"]), (req, res) => {
  const { eventId, pointTiers } = req.body;
  // pointTiers example: [20, 50, 100]
  const generated = [];

  for (const points of pointTiers) {
    let code;
    // Ensure uniqueness
    do {
      code = generateCode(eventId, points);
    } while (codes.find(c => c.code === code));

    const entry = {
      id: codes.length + 1,
      eventId,
      points,
      code,
      isUsed: false,
      usedBy: null,
      usedAt: null,
    };
    codes.push(entry);
    generated.push(entry);
  }

  res.json(generated);
});

// Student redeems a code
router.post("/redeem", auth(["student"]), (req, res) => {
  const { code } = req.body;
  const srn = req.user.srn;

  const entry = codes.find(c => c.code === code);

  if (!entry) return res.status(404).json({ error: "Code not found" });
  if (entry.isUsed) return res.status(400).json({ error: "Code already used" });

  // Security layer: Verify the student actually registered for this event
  const event = events.find(e => e.id === entry.eventId);
  if (!event) return res.status(404).json({ error: "Associated event not found." });
  
  if (!event.registeredStudents.includes(srn)) {
    return res.status(403).json({ error: "Only registered participants are eligible to redeem this code." });
  }

  // Mark as used
  entry.isUsed = true;
  entry.usedBy = srn;
  entry.usedAt = new Date().toISOString();

  // Update student points
  if (!studentPoints[srn]) studentPoints[srn] = 0;
  studentPoints[srn] += entry.points;

  // Add to transaction history
  if (!transactions[srn]) transactions[srn] = [];
  transactions[srn].push({
    type: "credit",
    points: entry.points,
    eventId: entry.eventId,
    code: entry.code,
    timestamp: new Date().toISOString(),
  });

  // Notify student in real time
  const io = req.app.get("io");
  io.to(srn).emit("points_credited", {
    points: entry.points,
    newBalance: studentPoints[srn],
  });
  
  // Write to blockchain completely silently
  ledger.recordCredit(srn, entry.points);

  res.json({ success: true, pointsEarned: entry.points, newBalance: studentPoints[srn] });
});

// Admin views all codes
router.get("/", auth(["admin"]), (req, res) => {
  res.json(codes);
});

module.exports = router;

// Shared state (in production use PostgreSQL)
const studentPoints = {};
const transactions = {};
module.exports.studentPoints = studentPoints;
module.exports.transactions = transactions;