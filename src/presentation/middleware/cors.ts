import cors from "cors";

export const corsHandler = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(" "),
  credentials: true,
});
