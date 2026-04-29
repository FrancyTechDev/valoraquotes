import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { origin: string }) => ({
    origin: String(input.origin || ""),
  }))
  .handler(async ({ data, context }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!secret || !priceId) {
      return { url: null, error: "Stripe not configured" };
    }

    const stripe = new Stripe(secret);
    const { userId, claims } = context;
    const email = (claims.email as string | undefined) ?? undefined;

    // Reuse customer if exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    const origin = data.origin || "https://valoraquotes.lovable.app";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/app?upgraded=1`,
      cancel_url: `${origin}/app?canceled=1`,
      client_reference_id: userId,
      metadata: { user_id: userId },
      subscription_data: { metadata: { user_id: userId } },
      allow_promotion_codes: true,
    });

    return { url: session.url, error: null };
  });
