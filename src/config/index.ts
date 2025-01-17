export const config = {
  stripe: {
    currency: "USD",
    products: {
      pro: {
        name: "Linguify Pro",
        description: "Unlimited hearts",
        priceUSD: 20.00,
      },
    },
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  points: {
    refill: 50,
  },
  urls: {
    frontend: process.env.FRONTEND_URL || "http://localhost:4200",
    returnUrl: "/shop",
  },
} as const;

// Validate required environment variables at startup
const requiredEnvVars = [
  "STRIPE_WEBHOOK_SECRET",
  "CLERK_WEBHOOK_SECRET",
] as const;

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
