import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ExternalLink, Image, Loader2, CheckCircle2, Info, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "");

const DEFAULT_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
    fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-2 0-4 1-4.5 2.5l-3.5 3.5-8.2-1.8c-.5-.1-.9.2-1 .7l-.3 1.3c-.2.8.2 1.6.9 2l6.4 3.2-1.7 2.6c-.3.5-.2 1.1.2 1.5l1 1c.4.4 1 .5 1.5.2l2.6-1.7 3.2 6.4c.4.8 1.2 1.1 2 .9l1.3-.3c.5-.1.8-.5.7-1z" />
  </svg>
);

export function LogoPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const { isLoading } = useQuery<{ url: string }>({
    queryKey: ["logo-url"],
    queryFn: () => fetch(`${API_BASE}/api/wp/logo`).then((r) => r.json()),
    onSuccess: (data) => {
      if (logoUrl === null) setLogoUrl(data.url ?? "");
    },
  } as Parameters<typeof useQuery>[0]);

  const saveMutation = useMutation({
    mutationFn: (url: string) =>
      fetch(`${API_BASE}/api/wp/logo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["logo-url"] });
      toast({ title: "تم الحفظ", description: "تم تحديث شعار الموقع." });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل الحفظ. تأكد من تثبيت إضافة الربط.", variant: "destructive" });
    },
  });

  const currentUrl = logoUrl ?? "";
  const hasLogo = currentUrl.trim() !== "";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-end space-y-1">
        <div className="flex items-center justify-end gap-3">
          <h1 className="text-3xl font-bold">شعار الموقع</h1>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Image className="w-5 h-5 text-primary" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          الشعار يظهر يسار اسم الموقع في شريط التنقل
        </p>
      </div>

      {/* Preview */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <p className="text-sm font-semibold text-muted-foreground text-end">معاينة الشريط</p>
        <div className="bg-[#1a1a2e] rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-gray-400 text-xs">≡</span>
          <a className="flex items-center gap-2 text-white font-semibold text-sm no-underline">
            {hasLogo ? (
              <img src={currentUrl} alt="Logo" className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              DEFAULT_SVG
            )}
            <span>Travel Valet <span className="text-[#c9a84c]">Düsseldorf</span></span>
          </a>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {hasLogo ? "شعارك المخصص" : "الأيقونة الافتراضية (طائرة ذهبية) — ستُستخدم إذا لم تضع رابطاً"}
        </p>
      </div>

      {/* Logo URL input */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            ارفع صورة الشعار على أي خدمة مثل{" "}
            <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="underline font-medium">imgur.com</a>
            {" "}أو مكتبة الوسائط في WordPress، ثم الصق رابط الصورة هنا.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">رابط الشعار (URL)</label>
          {isLoading || logoUrl === null ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري التحميل...
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={currentUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                dir="ltr"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
              />
              {hasLogo && (
                <button
                  onClick={() => setLogoUrl("")}
                  title="حذف الشعار"
                  className="px-3 rounded-lg border border-border hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => saveMutation.mutate(currentUrl)}
            disabled={saveMutation.isPending || isLoading || logoUrl === null}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5
                       text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {hasLogo ? "حفظ التغييرات" : "حفظ (بدون شعار)"}
          </button>
          <a
            href="https://xn--traveldsseldorf-5vb.de"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5
                       text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            معاينة على الموقع
          </a>
        </div>

        {saveMutation.isSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            تم الحفظ — يظهر على الموقع فور تحديث الصفحة
          </div>
        )}
      </div>
    </div>
  );
}
