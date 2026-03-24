const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = [
  { id: 1, username: "admin", password: bcrypt.hashSync("admin123", 10), role: "admin" },
  { id: 2, username: "SRN001", password: bcrypt.hashSync("student123", 10), role: "student", srn: "SRN001" },
  { id: 3, username: "SRN002", password: bcrypt.hashSync("student456", 10), role: "student", srn: "SRN002" },
  { id: 4, username: "cafe", password: bcrypt.hashSync("vendor123", 10), role: "vendor", name: "Campus Cafe" },
];

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, srn: user.srn },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token, role: user.role, username: user.username, srn: user.srn });
});

module.exports = router;