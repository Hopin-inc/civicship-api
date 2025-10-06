import { Request, Response } from "express";
import { auth } from "@/infrastructure/libs/firebase";

export async function handleSessionLogin(req: Request, res: Response) {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "Missing idToken" });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.json({ status: "success" });
  } catch (err: any) {
    console.error("🔥 Session login failed:", {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
