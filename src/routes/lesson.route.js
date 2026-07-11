import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { verifyOwner } from "../middlewares/owner.middleware.js";

const router = express.Router();

/* ===========================
   Add Lesson
=========================== */
router.post("/", async (req, res) => {
  try {
    const lesson = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,

      image: req.body.image || "",

      authorName: req.body.authorName,

      authorEmail: req.body.authorEmail,

      authorImage: req.body.authorImage,

      visibility: req.body.visibility || "Public",

      isPremium: req.body.isPremium || false,

      isFeatured: false,

      likes: 0,

      saved: 0,

      reportCount: 0,

      reviewed: false,

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
        visibility: "Public",
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
   Public Lessons
=========================== */
router.get("/", async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    let query = { visibility: "Public" };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    let sortOption = {};

    if (sort === "latest") sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { likes: -1 };

    const lessons = await db
      .collection("lessons")
      .find(query)
      .sort(sortOption)
      .toArray();

    res.send(lessons);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});
/* ===========================
   Public Lessons (Pagination)
=========================== */
router.get("/public", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    const skip = (page - 1) * limit;

    const filter = {
      visibility: "Public",
    };

    // Search
    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    // Category
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    // Premium
    if (req.query.premium === "true") {
      filter.isPremium = true;
    }

    const total = await db.collection("lessons").countDocuments(filter);

    const lessons = await db
      .collection("lessons")
      .find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({
      lessons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
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
    const { id } = req.params;
    const { isFeatured } = req.body;

    const result = await db.collection("lessons").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          isFeatured,
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
router.put("/:id", verifyAuth, verifyOwner, async (req, res) => {
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
   Like Lesson
=========================== */
router.patch("/like/:id", verifyAuth, async (req, res) => {
  try {
    const result = await db.collection("lessons").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $inc: {
          likes: 1,
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
   Delete Lesson
=========================== */
router.delete("/:id", verifyAuth, verifyOwner, async (req, res) => {
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
router.post("/favorite", verifyAuth, async (req, res) => {
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

    // Increase saved count
    await db.collection("lessons").updateOne(
      {
        _id: new ObjectId(favorite.lessonId),
      },
      {
        $inc: {
          saved: 1,
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
   Report Lesson
=========================== */
router.post("/report", verifyAuth, async (req, res) => {
  try {
    const report = req.body;

    const exist = await db.collection("reports").findOne({
      lessonId: report.lessonId,
      email: report.email,
    });

    if (exist) {
      return res.send({
        message: "Already Reported",
      });
    }

    report.createdAt = new Date();

    const result = await db.collection("reports").insertOne(report);

    await db.collection("lessons").updateOne(
      {
        _id: new ObjectId(report.lessonId),
      },
      {
        $inc: {
          reportCount: 1,
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
   My Favorites
=========================== */
router.get("/favorites/:email", verifyAuth, async (req, res) => {
  if (req.user.email !== req.params.email) {
    return res.status(403).send({
      message: "Forbidden",
    });
  }

  const favorites = await db
    .collection("favorites")
    .find({
      email: req.user.email,
    })
    .toArray();

  res.send(favorites);
});

/* ===========================
   Remove Favorite
=========================== */
router.delete("/favorite/:id", verifyAuth, async (req, res) => {
  try {
    const favorite = await db.collection("favorites").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!favorite) {
      return res.status(404).send({
        message: "Favorite not found",
      });
    }

    const result = await db.collection("favorites").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    // Decrease saved count
    await db.collection("lessons").updateOne(
      {
        _id: new ObjectId(favorite.lessonId),
      },
      {
        $inc: {
          saved: -1,
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
   My Lessons
  
=========================== */
router.get("/my/:email", verifyAuth, async (req, res) => {
  try {
    if (req.user.email !== req.params.email) {
      return res.status(403).send({
        message: "Forbidden",
      });
    }

    const lessons = await db
      .collection("lessons")
      .find({
        authorEmail: req.user.email,
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
