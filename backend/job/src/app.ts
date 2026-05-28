import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import jobRoutes from "./routes/job.js";
import cors  from 'cors'


const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/jobs",jobRoutes);


export default app;