import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// deno-lint-ignore-file no-explicit-any
import Stripe from "npm:stripe@14.25.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_PRICE_LOOKUP_KEY = Deno.env.get("STRIPE_PRICE_EMBEDDED") ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const { email, fullName, priceId } = (await req.json()) as {
      email: string;
      fullName?: string;
      priceId?: string;
    };
    if (!email) return new Response("Missing email", { status: 400 });

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = (customers.data[0] ??
      (await stripe.customers.create({ email, name: fullName }))) as any;

    const chosenPrice = priceId || STRIPE_PRICE_LOOKUP_KEY;
    if (!chosenPrice) {
      return new Response("Missing price configuration", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: "custom",
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: chosenPrice,
          quantity: 1,
        },
      ],
      // For embedded Checkout, only return_url is needed after confirmation on client
      return_url: "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
      allow_promotion_codes: true,
    });

    return Response.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(msg, { status: 400 });
  }
});
