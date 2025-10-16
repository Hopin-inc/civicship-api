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
}

export type PaymentProvider = "STRIPE" | "SQUARE";

export interface AppConfig {
  paymentProvider: PaymentProvider;
  stripe?: StripeConfig;
  square?: SquareConfig;
}

export function validateEnvironmentVariables(): AppConfig {
  const paymentProvider = process.env.PAYMENT_PROVIDER;

  if (!paymentProvider) {
    throw new Error('Missing required environment variable: PAYMENT_PROVIDER');
  }

  if (paymentProvider !== "STRIPE" && paymentProvider !== "SQUARE") {
    throw new Error(`PAYMENT_PROVIDER must be either "STRIPE" or "SQUARE", got: ${paymentProvider}`);
  }

  if (paymentProvider === "STRIPE") {
    const requiredStripeVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
    const missing = requiredStripeVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required Stripe environment variables: ${missing.join(', ')}`);
    }

    return {
      paymentProvider: "STRIPE",
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY!,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      },
    };
  }

  // paymentProvider === "SQUARE"
  const requiredSquareVars = [
    'SQUARE_ACCESS_TOKEN',
    'SQUARE_LOCATION_ID',
    'SQUARE_WEBHOOK_SECRET',
    'SQUARE_WEBHOOK_NOTIFICATION_URL',
    'SQUARE_ENVIRONMENT',
  ];
  const missing = requiredSquareVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Square environment variables: ${missing.join(', ')}`);
  }

  const squareEnv = process.env.SQUARE_ENVIRONMENT!;
  if (squareEnv !== "sandbox" && squareEnv !== "production") {
    throw new Error(`SQUARE_ENVIRONMENT must be either "sandbox" or "production", got: ${squareEnv}`);
  }

  return {
    paymentProvider: "SQUARE",
    square: {
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      locationId: process.env.SQUARE_LOCATION_ID!,
      webhookSecret: process.env.SQUARE_WEBHOOK_SECRET!,
      webhookNotificationUrl: process.env.SQUARE_WEBHOOK_NOTIFICATION_URL!,
      environment: squareEnv as "sandbox" | "production",
    },
  };
}
