import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// deno-lint-ignore-file no-explicit-any
import Stripe from "npm:stripe@14.25.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_PRICE_STUDENT_299 = Deno.env.get("STRIPE_PRICE_STUDENT_299") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:3000";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const { email, fullName, successPath, cancelPath } = (await req.json()) as {
      email: string;
      fullName?: string;
      successPath?: string;
      cancelPath?: string;
    };
    if (!email) return new Response("Missing email", { status: 400 });

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = (customers.data[0] ??
      (await stripe.customers.create({ email, name: fullName }))) as any;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: STRIPE_PRICE_STUDENT_299,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}${successPath || "/thanh-cong/premium"}`,
      cancel_url: `${APP_URL}${cancelPath || "/goi-dich-vu"}`,
      allow_promotion_codes: true,
    });

    return Response.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(msg, { status: 400 });
  }
});
