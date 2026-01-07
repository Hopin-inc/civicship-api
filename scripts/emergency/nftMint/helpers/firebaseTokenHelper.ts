import { auth } from "../../../../src/infrastructure/libs/firebase";
import logger from "../../../../src/infrastructure/logging";

export type FirebaseIdTokenResponse = {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
};

export async function getFirebaseIdTokenForUid(firebaseUid: string): Promise<string> {
  const apiKey = process.env.FIREBASE_TOKEN_API_KEY;
  if (!apiKey) {
    throw new Error("FIREBASE_TOKEN_API_KEY environment variable is not set");
  }

  logger.debug(`Creating custom token for Firebase UID`, { firebaseUid });
  const customToken = await auth.createCustomToken(firebaseUid);

  logger.debug(`Exchanging custom token for ID token`);
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true,
      }),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    logger.error(`Firebase signInWithCustomToken failed: ${res.status} ${res.statusText}`, {
      errorText,
    });
    throw new Error(`Firebase signInWithCustomToken failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  logger.debug(`Successfully obtained ID token for Firebase UID`, { firebaseUid });

  return data.idToken;
}
