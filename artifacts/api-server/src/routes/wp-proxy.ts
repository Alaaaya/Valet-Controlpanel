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

// ── Transparent Logo Image ────────────────────────────────────────────────────

router.get("/wp/logo-image", (req, res): void => {
  const imgPath = resolveStatic("logo-transparent.png");
  if (!fs.existsSync(imgPath)) {
    res.status(404).json({ error: "Logo image not found" });
    return;
  }
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.sendFile(imgPath);
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

// ── Booking Prices (control €12/€15 etc. in the live booking form) ───────────

const BP_DEFAULT = { freiflaeche: 1200, parkhaus: 1500, reinigung_aussen: 4000, reinigung_innen: 7000 };
const BP_FILE = path.resolve(__dirname, "../../data/booking-prices.json");

function readBpLocal(): Record<string, number> {
  try { return { ...BP_DEFAULT, ...JSON.parse(fs.readFileSync(BP_FILE, "utf8")) }; }
  catch { return { ...BP_DEFAULT }; }
}
function writeBpLocal(d: Record<string, unknown>): void {
  try { fs.mkdirSync(path.dirname(BP_FILE), { recursive: true }); fs.writeFileSync(BP_FILE, JSON.stringify(d, null, 2), "utf8"); }
  catch { /* ignore */ }
}

// Build the inline price-patch JS (embedded in base64 to avoid quote escaping issues)
function buildInlinePricePatch(prices: Record<string, number>): string {
  const PF  = Number(prices.freiflaeche)     || 1200;
  const PP  = Number(prices.parkhaus)         || 1500;
  const PRA = Number(prices.reinigung_aussen) || 4000;
  const PRI = Number(prices.reinigung_innen)  || 7000;

  const js = `(function(){
var PF=${PF},PP=${PP},PRA=${PRA},PRI=${PRI};
var myParkart='',myReinA=false,myReinI=false;
function getDays(){var a=document.getElementById('tvd_anreise'),b=document.getElementById('tvd_abreise');if(!a||!b||!a.value||!b.value)return 0;var d=(new Date(b.value)-new Date(a.value))/86400000;return d>0?Math.round(d):0;}
function myTotal(){var days=getDays();var pd=myParkart==='parkhaus'?PP:(myParkart?PF:0);return(days*pd+(myReinA?PRA:0)+(myReinI?PRI:0))/100;}
function fixDisplay(){var d=document.getElementById('tvd_price_display');if(d)d.textContent=myTotal().toFixed(2);var dd=document.getElementById('tvd_days_display');if(dd)dd.textContent=getDays();}
document.querySelectorAll('.tvd-parkart-opt').forEach(function(el){el.addEventListener('click',function(){myParkart=this.dataset.val||'';setTimeout(fixDisplay,0);});});
document.querySelectorAll('.tvd-rein-opt').forEach(function(el){el.addEventListener('click',function(){var val=this.dataset.val,cb=this.querySelector('input');if(val==='aussen')myReinA=!!cb.checked;else myReinI=!!cb.checked;setTimeout(fixDisplay,0);});});
var keine=document.querySelector('.tvd-keine-rein');if(keine)keine.addEventListener('click',function(){myReinA=false;myReinI=false;setTimeout(fixDisplay,0);});
['tvd_anreise','tvd_abreise'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('change',function(){setTimeout(fixDisplay,0);});});
var priceEl=document.getElementById('tvd_price_display');if(priceEl){var fixing=false;new MutationObserver(function(){if(fixing)return;fixing=true;fixDisplay();fixing=false;}).observe(priceEl,{childList:true,characterData:true,subtree:true});}
var summaryEl=document.getElementById('tvd-summary');if(summaryEl){new MutationObserver(function(){var spans=summaryEl.querySelectorAll('div:last-child span');if(spans.length>=2){var last=spans[spans.length-1];if(last.textContent&&last.textContent.indexOf('\u20ac')>-1){last.textContent='\u20ac'+myTotal().toFixed(2);}}}).observe(summaryEl,{childList:true,subtree:true});}
document.querySelectorAll('.tvd-parkart-opt').forEach(function(el){var spans=el.querySelectorAll('span');spans.forEach(function(sp){if(sp.textContent&&/\u20ac\d+\/Tag/.test(sp.textContent)){var val=el.dataset.val||'';sp.textContent='\u20ac'+((val==='parkhaus'?PP:PF)/100)+'/Tag';}});});
var origFetch=window.fetch;window.fetch=function(url,opts){if(opts&&opts.body instanceof FormData){try{if(opts.body.get('action')==='tvd_pl_submit_booking'){var nfd=new FormData();var tot=myTotal(),days=getDays();opts.body.forEach(function(v,k){if(k==='price')nfd.append('price',tot.toFixed(2));else if(k==='days')nfd.append('days',String(days));else nfd.append(k,v);});opts.body=nfd;}}catch(e){}}return origFetch.apply(this,arguments);};
console.log('[TVD] Price patch active. FF=\u20ac'+(PF/100)+' PH=\u20ac'+(PP/100));
})();`;

  const b64 = Buffer.from(js).toString("base64");
  return `<img src="x" onerror="this.onerror=null;Function(atob('${b64}'))();" style="display:none" alt="">`;
}

// Push the price-patch injection into WordPress parkingpro embed option
async function pushPricePatchEmbed(prices: Record<string, number>): Promise<void> {
  const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
  const WP_USER = process.env.WP_USERNAME ?? "";
  const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
  const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
  const embed   = buildInlinePricePatch(prices);
  await fetch(`${WP_URL}/wp-json/tvd-admin/v1/parkingpro`, {
    method: "POST",
    headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ embed }),
    signal: AbortSignal.timeout(5000),
  });
}

// Dynamically generated JS that patches booking form prices on the WP site
router.get("/wp/price-patch.js", (req, res): void => {
  const prices = readBpLocal();
  const PF  = Number(prices.freiflaeche)     || 1200;
  const PP  = Number(prices.parkhaus)         || 1500;
  const PRA = Number(prices.reinigung_aussen) || 4000;
  const PRI = Number(prices.reinigung_innen)  || 7000;

  const js = `(function(){
  var PF=${PF},PP=${PP},PRA=${PRA},PRI=${PRI};
  var myParkart='',myReinA=false,myReinI=false;

  function getDays(){
    var a=document.getElementById('tvd_anreise'),b=document.getElementById('tvd_abreise');
    if(!a||!b||!a.value||!b.value)return 0;
    var d=(new Date(b.value)-new Date(a.value))/86400000;
    return d>0?Math.round(d):0;
  }
  function myTotal(){
    var days=getDays();
    var pd=myParkart==='parkhaus'?PP:(myParkart?PF:0);
    return(days*pd+(myReinA?PRA:0)+(myReinI?PRI:0))/100;
  }
  function fixDisplay(){
    var d=document.getElementById('tvd_price_display');
    if(d)d.textContent=myTotal().toFixed(2);
    var dd=document.getElementById('tvd_days_display');
    if(dd)dd.textContent=getDays();
  }

  // Track parkart (additive — IIFE listeners still run for validation)
  document.querySelectorAll('.tvd-parkart-opt').forEach(function(el){
    el.addEventListener('click',function(){
      myParkart=this.dataset.val||'';
      setTimeout(fixDisplay,0);
    });
  });

  // Track reinigung
  document.querySelectorAll('.tvd-rein-opt').forEach(function(el){
    el.addEventListener('click',function(){
      var val=this.dataset.val,cb=this.querySelector('input');
      setTimeout(function(){
        if(val==='aussen')myReinA=!!cb.checked;
        else myReinI=!!cb.checked;
        fixDisplay();
      },0);
    });
  });
  var keine=document.querySelector('.tvd-keine-rein');
  if(keine)keine.addEventListener('click',function(){myReinA=false;myReinI=false;setTimeout(fixDisplay,0);});

  // Track date changes
  ['tvd_anreise','tvd_abreise'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('change',function(){setTimeout(fixDisplay,0);});
  });

  // MutationObserver to override price display whenever IIFE writes it
  var priceEl=document.getElementById('tvd_price_display');
  if(priceEl){
    var fixing=false;
    new MutationObserver(function(){
      if(fixing)return;
      fixing=true;
      fixDisplay();
      fixing=false;
    }).observe(priceEl,{childList:true,characterData:true,subtree:true});
  }

  // Fix summary price after buildSummary() runs
  var summaryEl=document.getElementById('tvd-summary');
  if(summaryEl){
    new MutationObserver(function(){
      var spans=summaryEl.querySelectorAll('div:last-child span');
      if(spans.length>=2){
        var last=spans[spans.length-1];
        if(last.textContent&&last.textContent.includes('\u20ac')){
          last.textContent='\u20ac'+myTotal().toFixed(2);
        }
      }
    }).observe(summaryEl,{childList:true,subtree:true});
  }

  // Fix price labels on parking buttons (e.g. €12/Tag → new value)
  document.querySelectorAll('.tvd-parkart-opt').forEach(function(el){
    var spans=el.querySelectorAll('span');
    spans.forEach(function(sp){
      if(sp.textContent&&sp.textContent.match(/\u20ac\d+\/Tag/)){
        var val=el.dataset.val||'';
        var price=val==='parkhaus'?PP:PF;
        sp.textContent='\u20ac'+(price/100)+'/Tag';
      }
    });
  });

  // Intercept fetch to fix submitted price
  var origFetch=window.fetch;
  window.fetch=function(url,opts){
    if(opts&&opts.body instanceof FormData){
      try{
        if(opts.body.get('action')==='tvd_pl_submit_booking'){
          var nfd=new FormData();
          var tot=myTotal(),days=getDays();
          opts.body.forEach(function(v,k){
            if(k==='price')nfd.append('price',tot.toFixed(2));
            else if(k==='days')nfd.append('days',String(days));
            else nfd.append(k,v);
          });
          opts.body=nfd;
        }
      }catch(e){}
    }
    return origFetch.apply(this,arguments);
  };

  console.log('[TVD] Price patch active. FF=\u20ac'+(PF/100)+' PH=\u20ac'+(PP/100));
})();`;

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send(js);
});

router.get("/wp/booking-prices", async (_req, res): Promise<void> => {
  try {
    const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
    const WP_USER = process.env.WP_USERNAME ?? "";
    const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
    const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
    const r = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/booking-prices`, {
      headers: { Authorization: `Basic ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (r.ok) {
      const d = await r.json() as Record<string, unknown>;
      if (d && typeof d.freiflaeche === "number") { res.json(d); return; }
    }
  } catch { /* fall through to local */ }
  res.json(readBpLocal());
});

router.post("/wp/booking-prices", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  writeBpLocal(body);

  // Always push the price-patch inject into WP parkingpro embed (best-effort)
  pushPricePatchEmbed(body as Record<string, number>).catch(() => { /* silent */ });

  try {
    const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
    const WP_USER = process.env.WP_USERNAME ?? "";
    const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
    const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
    const r = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/booking-prices`, {
      method: "POST",
      headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const d = await r.json();
    res.json({ ok: true, saved: true, wp: d });
    return;
  } catch { /* ignore */ }
  res.json({ ok: true, saved: true });
});

// ── Pricing (local-first, WordPress optional) ─────────────────────────────────

const PRICING_FILE = path.resolve(__dirname, "../../data/pricing.json");
const PRICING_DEFAULT = { day1: 39, day2: 49, day3: 59, extra_per_day: 10, currency: "EUR", label: "Parkgebühren" };

function readPricingLocal(): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(PRICING_FILE, "utf8"));
  } catch {
    return { ...PRICING_DEFAULT };
  }
}

function writePricingLocal(data: Record<string, unknown>): void {
  try {
    fs.mkdirSync(path.dirname(PRICING_FILE), { recursive: true });
    fs.writeFileSync(PRICING_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch { /* ignore */ }
}

router.get("/wp/pricing", async (_req, res): Promise<void> => {
  const local = readPricingLocal();
  // Try WordPress too, but local file is authoritative
  try {
    const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
    const WP_USER = process.env.WP_USERNAME ?? "";
    const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
    const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
    const r = await fetch(`${WP_URL}/wp-json/tvd-admin/v1/pricing`, {
      headers: { Authorization: `Basic ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (r.ok) {
      const wpData = await r.json() as Record<string, unknown>;
      if (wpData && typeof wpData.day1 === "number") {
        res.json(wpData);
        return;
      }
    }
  } catch { /* WP unavailable or plugin not installed — use local */ }
  res.json(local);
});

router.post("/wp/pricing", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  // Always save locally first
  writePricingLocal(body);
  // Try to sync to WordPress (best-effort)
  try {
    const WP_URL  = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
    const WP_USER = process.env.WP_USERNAME ?? "";
    const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");
    const token   = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
    await fetch(`${WP_URL}/wp-json/tvd-admin/v1/pricing`, {
      method: "POST",
      headers: { Authorization: `Basic ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
  } catch { /* ignore if WP not available */ }
  res.json({ ok: true, saved: true });
});

export default router;
