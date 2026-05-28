import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";

import app from "./app.js";

import connectDB from "./utils/connectDb.js";

import { initSocket } from "./config/socket.js";

// ================= CONNECT MONGODB =================

connectDB();

// ================= CREATE HTTP SERVER =================

const server =
  createServer(app);

// ================= INITIALIZE SOCKET =================

initSocket(server);

// ================= START SERVER =================

const PORT =
  process.env.PORT || 5004;

server.listen(PORT, () => {
  console.log(
    `Real Time service is running on http://localhost:${PORT}`
  );
});