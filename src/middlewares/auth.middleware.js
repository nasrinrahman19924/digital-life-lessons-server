import { auth } from "../auth/auth.js";
import { db } from "../config/db.js";

export const verifyAuth = async (req, res, next) => {
   console.log("🔥 verifyAuth called");
  
  console.log("COOKIE =", req.headers.cookie);

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  console.log("SESSION =", session);

  if (!session?.user) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }

  req.user = session.user;
  next();
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await db.collection("user").findOne({
      email: req.user.email,
    });

    if (!user || user.role !== "admin") {
      return res.status(403).send({
        message: "Forbidden",
      });
    }

    next();
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
