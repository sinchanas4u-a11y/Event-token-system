const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.set("io", io);

app.use("/auth", require("./routes/auth"));
app.use("/events", require("./routes/events"));
app.use("/codes", require("./routes/codes"));
app.use("/points", require("./routes/points"));
app.use("/vendor", require("./routes/vendor"));

require("./socket/handlers")(io);

app.get("/", (req, res) => res.json({ status: "Campus Token API running" }));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  require("./blockchain/ledger").init();
});