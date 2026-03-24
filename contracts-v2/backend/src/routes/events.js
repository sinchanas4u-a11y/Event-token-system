const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// In-memory store (replace with PostgreSQL later)
let events = [];
let eventIdCounter = 1;

// Admin creates an event
router.post("/", auth(["admin"]), (req, res) => {
  const { title, description, date, time, location } = req.body;
  const event = {
    id: eventIdCounter++,
    title,
    description,
    date,
    time,
    location,
    rewardPoints: req.body.rewardPoints || "TBD",
    status: "upcoming",
    registeredStudents: [],
    createdAt: new Date().toISOString(),
  };
  events.push(event);

  // Notify all students in real time
  const io = req.app.get("io");
  io.emit("new_event", event);

  res.json(event);
});

// Get all events (students and admin)
router.get("/", auth(["admin", "student", "vendor"]), (req, res) => {
  res.json(events);
});

// Admin marks event as completed
router.patch("/:id/complete", auth(["admin"]), (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ error: "Event not found" });
  event.status = "completed";
  res.json(event);
});

// Student registers for an event
router.post("/:id/register", auth(["student"]), (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ error: "Event not found" });
  
  const srn = req.user.srn;
  if (!event.registeredStudents.includes(srn)) {
    event.registeredStudents.push(srn);
  }
  
  res.json({ success: true, message: "Successfully registered", event });
});

module.exports = router;
module.exports.events = events;