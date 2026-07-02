import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/auth.js";
import adminRoute from "./routes/admin.route.js";
import paymentRoute from "./routes/payment.route.js";
import lessonRouter from "./routes/lesson.route.js";
import userRoute from "./routes/user.route.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());

app.all("/api/auth/{*any}", toNodeHandler(auth));

// Lesson Routes

app.use("/api/lessons", lessonRouter);

app.use("/api/admin", adminRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/users", userRoute);

app.get("/", (req, res) => {
  res.send("Server Running");
});

export default app;
