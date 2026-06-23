import express from "express";
import cors from "cors";
import chatRoutes from "./routes/message.js";

const app = express();

// --- UPDATED CORS CONFIGURATION ---
app.use(
  cors({
   origin: [
    "http://localhost:3000", 
    "https://m-icro-service-job-portal.vercel.app"
  ],
    credentials: true, // Crucial for passing auth tokens in chat requests
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
// ----------------------------------

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Realtime Chat Service Running 🚀",
  });
});

app.use("/api/chat", chatRoutes);

export default app;


// import express from "express";

// import cors from "cors";

// import chatRoutes from "./routes/message.js";

// const app = express();


// app.use(cors());

// app.use(express.json());

// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );



// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message:
//       "Realtime Chat Service Running 🚀",
//   });
// });



// app.use(
//   "/api/chat",
//   chatRoutes
// );

// export default app;