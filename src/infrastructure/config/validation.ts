export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

export interface AppConfig {
  stripe: StripeConfig;
}

export function validateEnvironmentVariables(): AppConfig {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    },
  };
}
