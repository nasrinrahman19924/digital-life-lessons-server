import { auth } from "../auth/auth.js";
import { db } from "../config/db.js";

export const verifyAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }

    req.user = session.user;

    next();
  } catch (err) {
    console.log("VerifyAuth Error:", err);

    res.status(401).send({
      message: "Unauthorized",
    });
  }
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
