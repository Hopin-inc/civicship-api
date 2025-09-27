export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  currency: string;
}

export interface AppConfig {
  frontendUrl: string;
  stripe: StripeConfig;
}

export function validateEnvironmentVariables(): AppConfig {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET', 
    'FRONTEND_URL'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    frontendUrl: process.env.FRONTEND_URL!,
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      currency: process.env.STRIPE_CURRENCY || 'usd',
    },
  };
}
