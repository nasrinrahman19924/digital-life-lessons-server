import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db.js";
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
    const usersCollection = db.collection("user");
    const lessonsCollection = db.collection("lessons");
    const reportsCollection = db.collection("reports");

    // ========= Counts =========

    const users = await usersCollection.countDocuments();

    const lessons = await lessonsCollection.countDocuments();

    const publicLessons = await lessonsCollection.countDocuments({
      visibility: "Public",
    });

    const privateLessons = await lessonsCollection.countDocuments({
      visibility: "Private",
    });

    const premiumLessons = await lessonsCollection.countDocuments({
      isPremium: true,
    });

    const featured = await lessonsCollection.countDocuments({
      isFeatured: true,
    });

    const reports = await reportsCollection.countDocuments();

    // ========= Today's Lessons =========

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const todayLessons = await lessonsCollection.countDocuments({
      createdAt: {
        $gte: today,
      },
    });

    // ========= Latest Lessons =========

    const latestLessons = await lessonsCollection
      .find({})
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .project({
        title: 1,
        authorName: 1,
        createdAt: 1,
      })
      .toArray();

    // ========= Most Active Contributors =========

    const contributors = await lessonsCollection
      .aggregate([
        {
          $group: {
            _id: "$authorEmail",
            name: {
              $first: "$authorName",
            },
            image: {
              $first: "$authorImage",
            },
            totalLessons: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            totalLessons: -1,
          },
        },
        {
          $limit: 5,
        },
      ])
      .toArray();

    // ========= Lesson Growth =========

    const lessonGrowth = await lessonsCollection
      .aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },
            lessons: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .toArray();

    // ========= User Growth =========

    const userGrowth = await usersCollection
      .aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },
            users: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .toArray();

    res.send({
      users,
      lessons,
      publicLessons,
      privateLessons,
      premiumLessons,
      featured,
      reports,
      todayLessons,
      latestLessons,
      contributors,
      lessonGrowth,
      userGrowth,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      message: err.message,
    });
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

router.patch("/featured/:id", verifyAuth, verifyAdmin, async (req, res) => {
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

router.patch("/review/:id", verifyAuth, verifyAdmin, async (req, res) => {
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
  verifyAuth,
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
router.delete(
  "/report/ignore/:id",
  verifyAuth,
  verifyAdmin,
  async (req, res) => {
    const result = await db.collection("reports").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  },
);

router.delete("/users/:id", verifyAuth, verifyAdmin, async (req, res) => {
  const result = await db.collection("user").deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.send(result);
});

export default router;
