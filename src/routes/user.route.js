import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

router.patch("/default-role", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db.collection("user").updateOne(
      { email },
      {
        $set: {
          role: "user",
          isPremium: false,
        },
      },
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

export default router;
