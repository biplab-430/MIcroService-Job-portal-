import express from "express";
import authRoutes from './routes/auth.js'
import { connectKafka } from "./producer.js";
import cors from 'cors'

const app = express();

// --- UPDATED CORS CONFIGURATION ---
app.use(cors({
    origin: "https://m-icro-service-job-portal.vercel.app", // Your Vercel frontend URL
    credentials: true, // This allows the JWT cookies to be sent and saved
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
// ----------------------------------

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
connectKafka();

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use('/api/auth', authRoutes);

export default app;
