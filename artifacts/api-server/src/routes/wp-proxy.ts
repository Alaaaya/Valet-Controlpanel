import { Router, type IRouter } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { wpGet, wpPost, wpDelete, wpGetSettings, wpUpdateSettings } from "../lib/wordpress";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router: IRouter = Router();

// ── WordPress Site Settings ──────────────────────────────────────────────────

router.get("/wp/settings", async (req, res): Promise<void> => {
  const data = await wpGetSettings();
  res.json(data);
});

router.patch("/wp/settings", async (req, res): Promise<void> => {
  const data = await wpUpdateSettings(req.body);
  res.json(data);
});

// ── WordPress Pages ──────────────────────────────────────────────────────────

router.get("/wp/pages", async (req, res): Promise<void> => {
  const perPage = req.query.per_page ?? 100;
  const data = await wpGet(`/pages?per_page=${perPage}&status=any`);
  res.json(data);
});

router.post("/wp/pages", async (req, res): Promise<void> => {
  const data = await wpPost("/pages", req.body);
  res.status(201).json(data);
});

router.get("/wp/pages/:id", async (req, res): Promise<void> => {
  const data = await wpGet(`/pages/${req.params.id}`);
  res.json(data);
});

router.patch("/wp/pages/:id", async (req, res): Promise<void> => {
  const data = await wpPost(`/pages/${req.params.id}`, req.body);
  res.json(data);
});

router.delete("/wp/pages/:id", async (req, res): Promise<void> => {
  const data = await wpDelete(`/pages/${req.params.id}?force=true`);
  res.json(data);
});

// ── WordPress Posts ──────────────────────────────────────────────────────────

router.get("/wp/posts", async (req, res): Promise<void> => {
  const perPage = req.query.per_page ?? 100;
  const data = await wpGet(`/posts?per_page=${perPage}&status=any`);
  res.json(data);
});

router.post("/wp/posts", async (req, res): Promise<void> => {
  const data = await wpPost("/posts", req.body);
  res.status(201).json(data);
});

router.get("/wp/posts/:id", async (req, res): Promise<void> => {
  const data = await wpGet(`/posts/${req.params.id}`);
  res.json(data);
});

router.patch("/wp/posts/:id", async (req, res): Promise<void> => {
  const data = await wpPost(`/posts/${req.params.id}`, req.body);
  res.json(data);
});

router.delete("/wp/posts/:id", async (req, res): Promise<void> => {
  const data = await wpDelete(`/posts/${req.params.id}?force=true`);
  res.json(data);
});

// ── WordPress Media ──────────────────────────────────────────────────────────

router.get("/wp/media", async (req, res): Promise<void> => {
  const data = await wpGet("/media?per_page=50");
  res.json(data);
});

router.delete("/wp/media/:id", async (req, res): Promise<void> => {
  const data = await wpDelete(`/media/${req.params.id}?force=true`);
  res.json(data);
});

// ── WordPress Categories ─────────────────────────────────────────────────────

router.get("/wp/categories", async (req, res): Promise<void> => {
  const data = await wpGet("/categories?per_page=100");
  res.json(data);
});

router.post("/wp/categories", async (req, res): Promise<void> => {
  const data = await wpPost("/categories", req.body);
  res.status(201).json(data);
});

router.patch("/wp/categories/:id", async (req, res): Promise<void> => {
  const data = await wpPost(`/categories/${req.params.id}`, req.body);
  res.json(data);
});

router.delete("/wp/categories/:id", async (req, res): Promise<void> => {
  const data = await wpDelete(`/categories/${req.params.id}?force=true`);
  res.json(data);
});

// ── WordPress Menus ──────────────────────────────────────────────────────────

router.get("/wp/menus", async (req, res): Promise<void> => {
  const data = await wpGet("/menus?per_page=100");
  res.json(data);
});

// ── WordPress Users ──────────────────────────────────────────────────────────

router.get("/wp/users/me", async (req, res): Promise<void> => {
  const data = await wpGet("/users/me");
  res.json(data);
});

// ── TVD Admin Bridge Plugin Download ─────────────────────────────────────────

function resolveStatic(filename: string): string {
  // Production (dist/static) or development (src/static, one level up from routes/)
  const candidates = [
    path.join(__dirname, "static", filename),
    path.join(__dirname, "..", "static", filename),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
}

router.get("/wp/download-bridge-plugin", (req, res): void => {
  const zipPath = resolveStatic("tvd-admin-bridge.zip");
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="tvd-admin-bridge.zip"');
  res.download(zipPath, "tvd-admin-bridge.zip");
});

// ── ParkingPro Plugin Download ────────────────────────────────────────────────

router.get("/wp/download-parkingpro-plugin", (req, res): void => {
  const zipPath = resolveStatic("parkingpro-booking-widgets.zip");
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="parkingpro-booking-widgets.zip"');
  res.download(zipPath, "parkingpro-booking-widgets.zip");
});

// ── ParkingPro embed code (stored in WordPress options via bridge) ─────────────

router.get("/wp/parkingpro", async (req, res): Promise<void> => {
  const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
  try {
    const r = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/parkingpro`, {
      headers: { Authorization: `Basic ${token}` },
    });
    const data = await r.json();
    res.json(data);
  } catch {
    res.json({ embed: "" });
  }
});

router.post("/wp/parkingpro", async (req, res): Promise<void> => {
  const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
  const r = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/parkingpro`, {
    method: "POST",
    headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await r.json();
  res.json(data);
});

// ── Logo URL (stored in WordPress options via bridge) ─────────────────────────

router.get("/wp/logo", async (req, res): Promise<void> => {
  const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
  try {
    const r = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/logo`, {
      headers: { Authorization: `Basic ${token}` },
    });
    const data = await r.json();
    res.json(data);
  } catch {
    res.json({ url: "" });
  }
});

router.post("/wp/logo", async (req, res): Promise<void> => {
  const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
  const r = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/logo`, {
    method: "POST",
    headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await r.json();
  res.json(data);
});

// ── TVD Admin Bridge: check if plugin is installed ───────────────────────────

router.get("/wp/bridge-status", async (req, res): Promise<void> => {
  try {
    const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
    const WP_USER = process.env.WP_USERNAME ?? "";
    const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
    const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
    const response = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/sections`, {
      headers: { Authorization: `Basic ${token}` },
    });
    if (response.ok) {
      res.json({ installed: true });
    } else {
      res.json({ installed: false });
    }
  } catch {
    res.json({ installed: false });
  }
});

// ── TVD Admin Bridge: sections proxy ─────────────────────────────────────────

router.get("/wp/live-sections", async (req, res): Promise<void> => {
  const WP_URL = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

  const response = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/sections`, {
    headers: { Authorization: `Basic ${token}` },
  });
  const data = await response.json();
  res.json(data);
});

router.post("/wp/live-sections", async (req, res): Promise<void> => {
  const WP_URL = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

  const response = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/sections`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.json(data);
});

// ── TVD Admin Bridge: booking email settings ──────────────────────────────────

router.get("/wp/booking-email", async (req, res): Promise<void> => {
  const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
  try {
    const response = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/booking-email`, {
      headers: { Authorization: `Basic ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "فشل الاتصال بـ WordPress" });
  }
});

router.post("/wp/booking-email", async (req, res): Promise<void> => {
  const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
  try {
    const response = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/booking-email`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "فشل الاتصال بـ WordPress" });
  }
});

export default router;
