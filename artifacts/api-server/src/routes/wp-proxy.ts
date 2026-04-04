import { Router, type IRouter } from "express";
import { wpGet, wpPost, wpDelete, wpGetSettings, wpUpdateSettings } from "../lib/wordpress";

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

export default router;
