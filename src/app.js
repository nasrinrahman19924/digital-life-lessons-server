import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import lessonRouter from "./routes/lesson.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import paymentRoute from "./routes/payment.route.js";
import commentRoute from "./routes/comment.route.js";

const app = express();

/* -----------------------------
   CORS
----------------------------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

/* -----------------------------
   Middlewares
----------------------------- */
app.use(cookieParser());
app.use(express.json());

/* -----------------------------
   Stripe Webhook
----------------------------- */
app.use(
  "/api/payment/webhook",
  express.raw({
    type: "application/json",
  })
);



/* -----------------------------
   Routes
----------------------------- */
app.use("/api/users", userRoute);
app.use("/api/lessons", lessonRouter);
app.use("/api/admin", adminRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/comments", commentRoute);

/* -----------------------------
   Health Check
----------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 Digital Life Lessons Server Running...");
});

export default app;