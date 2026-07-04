import { ObjectId } from "mongodb";
import { db } from "../config/db.js";

export const verifyOwner = async (req, res, next) => {
  const lesson = await db.collection("lessons").findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!lesson) {
    return res.status(404).send({
      message: "Lesson not found",
    });
  }

  if (lesson.authorEmail !== req.user.email) {
    return res.status(403).send({
      message: "Forbidden",
    });
  }

  next();
};
