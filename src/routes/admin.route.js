import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  const users = await db.collection("user").find().toArray();

  const newUsers = await Promise.all(
    users.map(async (user) => {
      const totalLessons = await db.collection("lessons").countDocuments({
        email: user.email,
      });

      return {
        ...user,
        totalLessons,
      };
    }),
  );

  res.send(newUsers);
});

router.patch("/users/:id", async (req, res) => {
  const result = await db.collection("user").updateOne(
    {
      _id: new ObjectId(req.params.id),
    },
    {
      $set: {
        role: "admin",
      },
    },
  );

  res.send(result);
});

router.get("/lessons", async (req, res) => {
  const lessons = await db.collection("lessons").find().toArray();
  res.send(lessons);
});

router.patch("/featured/:id", async (req, res) => {
  const result = await db.collection("lessons").updateOne(
    {
      _id: new ObjectId(req.params.id),
    },
    {
      $set: {
        isFeatured: true,
      },
    },
  );

  res.send(result);
});

router.put("/profile", async (req, res) => {
  const { email, name, image } = req.body;

  const result = await db.collection("user").updateOne(
    {
      email,
    },
    {
      $set: {
        name,
        image,
      },
    },
  );

  res.send(result);
});

router.patch("/review/:id", async (req, res) => {
  const result = await db.collection("lessons").updateOne(
    {
      _id: new ObjectId(req.params.id),
    },
    {
      $set: {
        reviewed: true,
      },
    },
  );

  res.send(result);
});
router.get("/reports", async (req, res) => {
  const reports = await db.collection("reports").find().toArray();

  res.send(reports);
});
router.delete("/report/delete/:id", async (req, res) => {
  const result = await db.collection("lessons").deleteOne({
    _id: new ObjectId(req.params.id),
  });

  await db.collection("reports").deleteMany({
    lessonId: req.params.id,
  });

  res.send(result);
});
router.delete("/report/ignore/:id", async (req, res) => {
  const result = await db.collection("reports").deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.send(result);
});

router.delete("/users/:id", async (req, res) => {
  const result = await db.collection("user").deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.send(result);
});

export default router;
