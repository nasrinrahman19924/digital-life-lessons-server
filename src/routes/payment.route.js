import express from "express";
import Stripe from "stripe";
import { db } from "../config/db.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =====================================
   Create Checkout Session
===================================== */
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      customer_email: email,

      line_items: [
        {
          price_data: {
            currency: "usd",

            product_data: {
              name: "Premium Membership",
            },

            // $15.00
            unit_amount: 1500,
          },

          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.CLIENT_URL}/pricing`,
    });

    res.send({
      success: true,
      url: session.url,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================
   Verify Payment & Upgrade User
===================================== */
router.get("/verify", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).send({
        success: false,
        message: "Session ID is required",
      });
    }

    // Stripe Session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).send({
        success: false,
        message: "Payment not completed",
      });
    }

    // Update User Role
    await db.collection("user").updateOne(
      { email: session.customer_email },
      {
        $set: {
          role: "premium",
          isPremium: true,
          premiumSince: new Date(),
        },
      },
    );

    return res.send({
      success: true,
      message: "Premium activated successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});
export default router;
