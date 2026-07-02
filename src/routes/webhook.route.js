import express from "express";
import Stripe from "stripe";
import { db } from "../config/db.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      await db.collection("user").updateOne(
        {
          email: session.customer_email,
        },
        {
          $set: {
            isPremium: true,
          },
        },
      );

      console.log("Premium Updated");
    }

    res.send({ received: true });
  },
);

export default router;
