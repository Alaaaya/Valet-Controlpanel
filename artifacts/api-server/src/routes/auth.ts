import { Router, type IRouter } from "express";
import crypto from "crypto";

const router: IRouter = Router();

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET ?? "fallback-secret";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function makeToken(username: string): string {
  const ts = Date.now().toString();
  const sig = sign(`${username}:${ts}`);
  return Buffer.from(JSON.stringify({ username, ts, sig })).toString("base64url");
}

export function verifyToken(token: string): boolean {
  try {
    const { username, ts, sig } = JSON.parse(Buffer.from(token, "base64url").toString());
    const expected = sign(`${username}:${ts}`);
    const valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    // Token expires after 7 days
    const expired = Date.now() - parseInt(ts) > 7 * 24 * 60 * 60 * 1000;
    return valid && !expired;
  } catch {
    return false;
  }
}

router.post("/auth/login", (req, res): void => {
  const { username, password } = req.body ?? {};
  const ADMIN_USER = process.env.ADMIN_USERNAME ?? "";
  const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? "";

  if (!ADMIN_USER || !ADMIN_PASS) {
    res.status(500).json({ error: "بيانات الدخول غير مضبوطة على السيرفر" });
    return;
  }

  const userMatch = username === ADMIN_USER;
  const passMatch = password === ADMIN_PASS;

  if (!userMatch || !passMatch) {
    res.status(401).json({ error: "اسم المستخدم أو كلمة السر غير صحيحة" });
    return;
  }

  const token = makeToken(username);
  res.json({ token, username });
});

router.get("/auth/verify", (req, res): void => {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (verifyToken(token)) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

export default router;
