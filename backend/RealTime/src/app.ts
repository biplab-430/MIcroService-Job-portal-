import express from "express";

import cors from "cors";

import chatRoutes from "./routes/message.js";

const app = express();


app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);



app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Realtime Chat Service Running 🚀",
  });
});



app.use(
  "/api/chat",
  chatRoutes
);

export default app;