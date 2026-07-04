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
            currency: "usd",

            product_data: {
              name: "Premium Membership",
            },

            // 1500 BDT ≈ 15 USD (example)
            unit_amount: 1500,
          },

          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.CLIENT_URL}/pricing`,
    });

    res.send({
      url: session.url,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});

export default router;
