import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db.js";

const router = express.Router();

/* ===========================
   Add Lesson
=========================== */
router.post("/", async (req, res) => {
  try {
    const lesson = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db.collection("lessons").insertOne(lesson);

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   Featured Lessons
=========================== */
router.get("/featured/all", async (req, res) => {
  try {
    const lessons = await db
      .collection("lessons")
      .find({
        isFeatured: true,
      })
      .limit(6)
      .toArray();

    res.send(lessons);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   Dashboard Stats
=========================== */
router.get("/stats", async (req, res) => {
  try {
    const users = await db.collection("user").countDocuments();

    const lessons = await db.collection("lessons").countDocuments({
      visibility: "Public",
    });

    const reports = await db.collection("reports").countDocuments();

    const featured = await db.collection("lessons").countDocuments({
      isFeatured: true,
    });

    res.send({
      users,
      lessons,
      reports,
      featured,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   Single Lesson
=========================== */
router.get("/single/:id", async (req, res) => {
  try {
    const lesson = await db.collection("lessons").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(lesson);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   Make Featured
=========================== */
router.patch("/featured/:id", async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   Update Lesson
=========================== */
router.put("/:id", async (req, res) => {
  try {
    const result = await db.collection("lessons").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: req.body,
      },
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   Delete Lesson
=========================== */
router.delete("/:id", async (req, res) => {
  try {
    const result = await db.collection("lessons").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   Favorite Lesson
=========================== */
router.post("/favorite", async (req, res) => {
  try {
    const favorite = req.body;

    const exist = await db.collection("favorites").findOne({
      lessonId: favorite.lessonId,
      email: favorite.email,
    });

    if (exist) {
      return res.send({
        message: "Already Added",
      });
    }

    const result = await db.collection("favorites").insertOne(favorite);

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   My Favorites
=========================== */
router.get("/favorites/:email", async (req, res) => {
  try {
    const favorites = await db
      .collection("favorites")
      .find({
        email: req.params.email,
      })
      .toArray();

    res.send(favorites);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   Remove Favorite
=========================== */
router.delete("/favorite/:id", async (req, res) => {
  try {
    const result = await db.collection("favorites").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

/* ===========================
   My Lessons
   ⚠️ সবশেষে রাখতে হবে
=========================== */
router.get("/:email", async (req, res) => {
  try {
    const lessons = await db
      .collection("lessons")
      .find({
        authorEmail: req.params.email,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.send(lessons);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

export default router;
