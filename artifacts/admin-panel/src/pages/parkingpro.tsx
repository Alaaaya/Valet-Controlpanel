import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ExternalLink, Info, CheckCircle2, Loader2, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "");

export function ParkingProPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [embedCode, setEmbedCode] = useState<string | null>(null);

  const { isLoading } = useQuery<{ embed: string }>({
    queryKey: ["parkingpro-embed"],
    queryFn: () => fetch(`${API_BASE}/api/wp/parkingpro`).then((r) => r.json()),
    onSuccess: (data) => {
      if (embedCode === null) setEmbedCode(data.embed ?? "");
    },
  } as Parameters<typeof useQuery>[0]);

  const saveMutation = useMutation({
    mutationFn: (embed: string) =>
      fetch(`${API_BASE}/api/wp/parkingpro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embed }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parkingpro-embed"] });
      toast({ title: "تم الحفظ", description: "تم تحديث ويدجت ParkingPro على الموقع." });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل الحفظ. تأكد من تثبيت الإضافة.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (embedCode !== null) saveMutation.mutate(embedCode);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-end space-y-1">
        <div className="flex items-center justify-end gap-3">
          <h1 className="text-3xl font-bold">ParkingPro</h1>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Car className="w-5 h-5 text-primary" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          إدارة ويدجت الحجز على موقعك —{" "}
          <a
            href="https://xn--traveldsseldorf-5vb.de"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary"
          >
            traveldüsseldorf.de
          </a>
        </p>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-semibold">كيف يعمل؟</p>
          <p>
            قسم ParkingPro يظهر تلقائياً على موقعك. الصق هنا كود الويدجت أو الـ
            shortcode الذي أرسله لك ParkingPro، وسيظهر مباشرة داخل القسم.
          </p>
          <p className="text-blue-600 text-xs">
            مثال: <span dir="ltr" className="font-mono bg-blue-100 px-1 rounded">[parkingpro_widget id="123"]</span>
            {" "}أو كود iframe كامل
          </p>
        </div>
      </div>

      {/* Embed code editor */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-muted-foreground">
            كود الويدجت
          </label>
          {!isLoading && embedCode !== null && embedCode.trim() !== "" && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              كود محفوظ
            </span>
          )}
        </div>

        {isLoading || embedCode === null ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التحميل...
          </div>
        ) : (
          <textarea
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
            placeholder={"الصق هنا كود الويدجت من ParkingPro\nمثال: [parkingpro_widget]\nأو: <iframe src=\"...\" />"}
            dir="ltr"
            rows={7}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono
                       resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60
                       placeholder:dir-rtl placeholder:font-sans"
          />
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || isLoading || embedCode === null}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5
                       text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ على الموقع
          </button>
          <a
            href="https://xn--traveldsseldorf-5vb.de#parkingpro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5
                       text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            معاينة على الموقع
          </a>
        </div>
      </div>

      {/* Section visibility reminder */}
      <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm text-muted-foreground text-end">
        <span className="font-medium text-foreground">ترتيب القسم:</span>{" "}
        يمكنك تغيير ترتيب قسم ParkingPro أو إخفاءه من صفحة{" "}
        <Link href="/sections" className="underline text-primary font-medium">
          إدارة الأقسام
        </Link>
        .
      </div>
    </div>
  );
}
