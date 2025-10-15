export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

export interface SquareConfig {
  accessToken: string;
  locationId: string;
  webhookSecret: string;
  webhookNotificationUrl: string;
  environment: "sandbox" | "production";
  supportEmail: string;
}

export interface AppConfig {
  stripe: StripeConfig;
  square: SquareConfig;
}

export function validateEnvironmentVariables(): AppConfig {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SQUARE_ACCESS_TOKEN',
    'SQUARE_LOCATION_ID',
    'SQUARE_WEBHOOK_SECRET',
    'SQUARE_WEBHOOK_NOTIFICATION_URL',
    'SQUARE_ENVIRONMENT',
    'SQUARE_SUPPORT_EMAIL',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const squareEnv = process.env.SQUARE_ENVIRONMENT!;
  if (squareEnv !== "sandbox" && squareEnv !== "production") {
    throw new Error(`SQUARE_ENVIRONMENT must be either "sandbox" or "production", got: ${squareEnv}`);
  }

  return {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    },
    square: {
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      locationId: process.env.SQUARE_LOCATION_ID!,
      webhookSecret: process.env.SQUARE_WEBHOOK_SECRET!,
      webhookNotificationUrl: process.env.SQUARE_WEBHOOK_NOTIFICATION_URL!,
      environment: squareEnv as "sandbox" | "production",
      supportEmail: process.env.SQUARE_SUPPORT_EMAIL!,
    },
  };
}
