import express from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { email } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      customer_email: email,

      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: "Digital Life Lessons Premium",
              description: "Lifetime Premium Membership",
            },
            unit_amount: 150000, // ৳1500
          },
          quantity: 1,
        },
      ],

      success_url:
        "https://digital-life-lessons-client-b987.vercel.app/payment/success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url: "https://digital-life-lessons-client-b987.vercel.app/payment/cancel",
    });

    res.send({
      url: session.url,
    });
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

export default router;
