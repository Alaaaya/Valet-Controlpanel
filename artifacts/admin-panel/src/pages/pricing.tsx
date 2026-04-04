import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, CheckCircle2, Euro, Calculator, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "");

type Pricing = {
  day1: number;
  day2: number;
  day3: number;
  extra_per_day: number;
  currency: string;
  label: string;
};

const DEFAULT_PRICING: Pricing = {
  day1: 39,
  day2: 49,
  day3: 59,
  extra_per_day: 10,
  currency: "EUR",
  label: "Parkgebühren",
};

function calcPrice(pricing: Pricing, days: number): number {
  if (days <= 0) return 0;
  if (days === 1) return pricing.day1;
  if (days === 2) return pricing.day2;
  return pricing.day3 + (days - 3) * pricing.extra_per_day;
}

function PriceField({
  label, sublabel, value, onChange, min = 0, max = 999, step = 1,
}: {
  label: string; sublabel?: string; value: number;
  onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold">{label}</label>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1.5">
          <Euro className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="number"
            value={value}
            min={min} max={max} step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 bg-transparent text-sm font-bold text-right focus:outline-none"
          />
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

export function PricingPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [pricing, setPricing] = useState<Pricing | null>(null);

  const { data, isLoading, refetch } = useQuery<Pricing>({
    queryKey: ["pricing"],
    queryFn: () => fetch(`${API_BASE}/api/wp/pricing`).then((r) => r.json()),
    staleTime: 0,
  });

  useEffect(() => {
    if (data && pricing === null) {
      setPricing({ ...DEFAULT_PRICING, ...data });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (p: Pricing) =>
      fetch(`${API_BASE}/api/wp/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing"] });
      toast({ title: "تم الحفظ", description: "تم تحديث جدول الأسعار." });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل الحفظ.", variant: "destructive" });
    },
  });

  const p = pricing ?? DEFAULT_PRICING;
  const set = (field: keyof Pricing) => (val: number) =>
    setPricing((prev) => ({ ...(prev ?? DEFAULT_PRICING), [field]: val }));

  const previewDays = [1, 2, 3, 4, 5, 6, 7, 10, 14];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">جدول الأسعار</h1>
        <p className="text-muted-foreground mt-2">
          حدد سعر كل يوم — يُحسب السعر تلقائياً بناءً على عدد أيام الحجز.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pricing Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary" />
              إعداد الأسعار
            </CardTitle>
            <CardDescription>
              اليوم الأول والثاني يُحددان مباشرةً. من اليوم الثالث فصاعداً يُضاف مبلغ ثابت لكل يوم.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading && pricing === null ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحميل...
              </div>
            ) : (
              <>
                <PriceField
                  label="سعر اليوم الواحد"
                  sublabel="مثال: دخول وخروج في نفس اليوم"
                  value={p.day1} onChange={set("day1")} min={1} max={500}
                />
                <PriceField
                  label="سعر يومين"
                  sublabel="مثال: دخول يوم 4، خروج يوم 5"
                  value={p.day2} onChange={set("day2")} min={1} max={500}
                />
                <PriceField
                  label="سعر 3 أيام (قاعدة اليوم الثالث)"
                  sublabel="يُستخدم كأساس لحساب 3 أيام فأكثر"
                  value={p.day3} onChange={set("day3")} min={1} max={500}
                />

                <div className="border-t pt-4">
                  <PriceField
                    label="إضافة لكل يوم (من اليوم الرابع)"
                    sublabel={`مثال: 4 أيام = ${p.day3} + ${p.extra_per_day} = ${p.day3 + p.extra_per_day}€`}
                    value={p.extra_per_day} onChange={set("extra_per_day")} min={0} max={100}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => saveMutation.mutate(p)}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5
                               text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saveMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Save className="w-4 h-4" />}
                    حفظ الأسعار
                  </button>
                  <button
                    onClick={() => { setPricing(null); refetch(); }}
                    disabled={isLoading}
                    className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5
                               text-sm font-medium hover:bg-muted/50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    إعادة تحميل
                  </button>
                </div>
                {saveMutation.isSuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    تم الحفظ بنجاح
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Live Preview Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              جدول الأسعار المحسوب
            </CardTitle>
            <CardDescription>
              يتحدث تلقائياً عند تغيير الأسعار — هكذا سيرى العميل الأسعار.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">عدد الأيام</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">مثال الفترة</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {previewDays.map((days, i) => {
                    const price = calcPrice(p, days);
                    const isHighlighted = days === 3;
                    return (
                      <tr
                        key={days}
                        className={`border-b border-border last:border-0 transition-colors ${
                          isHighlighted ? "bg-primary/5" : i % 2 === 0 ? "bg-background" : "bg-muted/20"
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold">
                          {days === 1 ? "يوم واحد" : days === 2 ? "يومان" : `${days} أيام`}
                          {days >= 3 && (
                            <span className="text-xs text-muted-foreground mr-1">
                              {days === 3 ? "(قاعدة)" : `(+${p.extra_per_day * (days - 3)}€)`}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs" dir="ltr">
                          {`04.04 → ${String(4 + days).padStart(2, "0")}.04`}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <span className="font-bold text-primary text-base">{price}€</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              الحساب: اليوم الأول = تاريخ التسليم → تاريخ الاستلام (نفس اليوم = يوم واحد)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
