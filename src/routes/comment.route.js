import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

router.get("/:lessonId", async (req, res) => {
  const comments = await db
    .collection("comments")
    .find({
      lessonId: req.params.lessonId,
    })
    .toArray();

  res.send(comments);
});

router.post("/", async (req, res) => {
  const result = await db.collection("comments").insertOne(req.body);

  res.send(result);
});

export default router;
