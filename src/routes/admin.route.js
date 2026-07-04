import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import { verifyAuth, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/users", verifyAuth, verifyAdmin, async (req, res) => {
  const users = await db.collection("user").find().toArray();

  const newUsers = await Promise.all(
    users.map(async (user) => {
      const totalLessons = await db.collection("lessons").countDocuments({
        authorEmail: user.email,
      });

      return {
        ...user,
        totalLessons,
      };
    }),
  );

  res.send(newUsers);
});

router.get("/analytics", async (req, res) => {
  try {
    const users = await db.collection("user").countDocuments();

    const lessons = await db.collection("lessons").countDocuments();

    const publicLessons = await db.collection("lessons").countDocuments({
      visibility: "Public",
    });

    const premiumLessons = await db.collection("lessons").countDocuments({
      isPremium: true,
    });

    const reports = await db.collection("reports").countDocuments();

    const featured = await db.collection("lessons").countDocuments({
      isFeatured: true,
    });

    res.send({
      users,
      lessons,
      publicLessons,
      premiumLessons,
      reports,
      featured,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.patch("/users/:id", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    const result = await db.collection("user").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          role,
        },
      },
    );

    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

router.patch("/featured/:id",verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { isFeatured } = req.body;

    const result = await db.collection("lessons").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          isFeatured,
        },
      },
    );

    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

router.get("/lessons", verifyAuth, verifyAdmin, async (req, res) => {
  const lessons = await db.collection("lessons").find().toArray();
  res.send(lessons);
});
router.delete("/lessons/:id", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const result = await db.collection("lessons").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
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

router.patch("/review/:id",verifyAuth, verifyAdmin, async (req, res) => {
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
router.get("/reports", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const reports = await db.collection("reports").find().toArray();

    const data = await Promise.all(
      reports.map(async (report) => {
        const lesson = await db.collection("lessons").findOne({
          _id: new ObjectId(report.lessonId),
        });

        return {
          ...report,
          lesson,
        };
      }),
    );

    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});
router.delete(
  "/report/delete/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const result = await db.collection("lessons").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    await db.collection("reports").deleteMany({
      lessonId: req.params.id,
    });

    res.send(result);
  },
);
router.delete("/report/ignore/:id",verifyAuth, verifyAdmin, async (req, res) => {
  const result = await db.collection("reports").deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.send(result);
});

router.delete("/users/:id",verifyAuth, verifyAdmin, async (req, res) => {
  const result = await db.collection("user").deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.send(result);
});

export default router;
