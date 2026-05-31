import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jobRoutes from "./routes/job.js";

// Initialize environment variables
dotenv.config();

const app = express();

// --- UPDATED CORS CONFIGURATION ---
// This array holds all the URLs allowed to talk to your backend
const allowedOrigins = [
  "http://localhost:3000",                        // Your local frontend for testing
  "https://m-icro-service-job-portal.vercel.app"  // Your live production frontend
];


app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://m-icro-service-job-portal.vercel.app"
  ],
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

// --- MIDDLEWARE ---
app.use(express.json());

// --- ROUTES ---
app.use("/api/jobs", jobRoutes);

export default app;