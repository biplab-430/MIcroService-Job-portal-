import express from "express";
import dotenv from "dotenv";
import router from "./routes.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { startSendMailConsumer } from "./consumer.js";

dotenv.config();
startSendMailConsumer();

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();

// ✅ Enable CORS
app.use(cors());

// ✅ IMPORTANT: Body parsers MUST come before routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Routes
app.use("/api/utilsService", router);

// ✅ Health check route (optional but useful)
app.get("/", (req, res) => {
  res.send("Utils Service is running 🚀");
});

// ✅ Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Utils service is running at http://localhost:${PORT}`);
});