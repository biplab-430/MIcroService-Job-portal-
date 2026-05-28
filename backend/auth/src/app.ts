import express from "express";
import authRoutes from './routes/auth.js'
import { connectKafka } from "./producer.js";
import cors from 'cors'

const app= express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
connectKafka();

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use('/api/auth', authRoutes);

export default app;