import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import userRoute from './routes/user.js';
const app = express();
app.use(express.json());
app.use('/api/user', userRoute);
app.listen(process.env.PORT, () => {
    console.log(`user service is running on http://localhost:${process.env.PORT}`);
});
