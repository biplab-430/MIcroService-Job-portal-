import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import userRoute from './routes/user.js';
import cors from 'cors'

const app = express();

// --- UPDATED CORS CONFIGURATION ---
app.use(cors({
    origin: "https://m-icro-service-job-portal.vercel.app", // Your Vercel frontend URL
    credentials: true, // Allows your frontend to securely fetch user profiles and send cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
// ----------------------------------

app.use(express.json());

app.use('/api/user', userRoute);

app.listen(process.env.PORT, () => {
  console.log(`user service is running on http://localhost:${process.env.PORT}`);
});


// import express from 'express'
// import dotenv from 'dotenv'
// dotenv.config();
// import userRoute from './routes/user.js';
// import cors from 'cors'

// const app=express();
// app.use(cors())
// app.use(express.json());

// app.use('/api/user', userRoute);

// app.listen(process.env.PORT, () => {
//   console.log(`user service is running on http://localhost:${process.env.PORT}`);
// });
