import express from "express";

const router = express.Router();

router.get("/security.txt", (_req, res) => {
  res.type("text/plain");
  res.send(
    `Contact: mailto:info@hopin.co.jp
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: ja, en
`,
  );
});

export default router;
