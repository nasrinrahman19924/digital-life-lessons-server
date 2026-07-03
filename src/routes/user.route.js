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
router.get("/:email", async (req, res) => {
  const email = req.params.email;

  const user = await db.collection("user").findOne({
    email,
  });

  res.send(user);
});

router.get("/:email", async (req, res) => {
  const user = await db.collection("user").findOne({
    email: req.params.email,
  });

  res.send(user);
});
router.patch("/make-admin", async (req, res) => {
  const { email } = req.body;

  const result = await db.collection("user").updateOne(
    {
      email,
    },
    {
      $set: {
        role: "admin",
      },
    },
  );

  res.send(result);
});

export default router;
