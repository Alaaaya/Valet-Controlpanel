import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Euro, Save, Loader2, CheckCircle2, RefreshCw, Car, Building2, Sparkles, Info } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "");

interface BookingPrices {
  freiflaeche: number;
  parkhaus: number;
  reinigung_aussen: number;
  reinigung_innen: number;
}

const DEFAULTS: BookingPrices = {
  freiflaeche: 1200,
  parkhaus: 1500,
  reinigung_aussen: 4000,
  reinigung_innen: 7000,
};

function centsToEur(cents: number) {
  return (cents / 100).toFixed(0);
}
function eurToCents(eur: number) {
  return Math.round(eur * 100);
}

interface PriceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  valueEur: number;
  onChange: (eur: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  color?: string;
}

function PriceCard({ icon, title, subtitle, valueEur, onChange, min = 1, max = 500, suffix = "/Tag", color = "text-primary" }: PriceCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 ${color} shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-bold text-primary">€</span>
        <input
          type="number"
          min={min}
          max={max}
          value={valueEur}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
          }}
          className="w-20 text-center rounded-lg border border-border bg-background px-2 py-1.5
                     text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/40
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs text-muted-foreground w-10">{suffix}</span>
      </div>
    </div>
  );
}

export function PricingPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [prices, setPrices] = useState<BookingPrices | null>(null);

  const { data, isLoading, refetch } = useQuery<BookingPrices>({
    queryKey: ["booking-prices"],
    queryFn: () => fetch(`${API_BASE}/api/wp/booking-prices`).then((r) => r.json()),
    staleTime: 0,
  });

  useEffect(() => {
    if (data && prices === null) {
      setPrices({ ...DEFAULTS, ...data });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (p: BookingPrices) =>
      fetch(`${API_BASE}/api/wp/booking-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking-prices"] });
      toast({ title: "تم الحفظ", description: "تم تحديث أسعار الحجز على الموقع." });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل الحفظ.", variant: "destructive" });
    },
  });

  const p = prices ?? DEFAULTS;

  const setField = (field: keyof BookingPrices) => (eur: number) =>
    setPrices((prev) => ({ ...(prev ?? DEFAULTS), [field]: eurToCents(eur) }));

  const totalDays = (days: number) => {
    const rate = p.freiflaeche;
    return ((days * rate) / 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">أسعار الحجز</h1>
        <p className="text-muted-foreground mt-2">
          التحكم بالأسعار التي تظهر في نموذج الحجز على الموقع.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-4">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          هذه الأسعار تظهر مباشرةً في نموذج الحجز على موقع <strong>traveldüsseldorf.de</strong> وتُستخدم في حساب إجمالي السعر.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Price Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary" />
              أسعار مواقف الانتظار
            </CardTitle>
            <CardDescription>السعر بالأورو لكل يوم حجز</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && prices === null ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحميل...
              </div>
            ) : (
              <>
                <PriceCard
                  icon={<Car className="w-5 h-5" />}
                  title="Freifläche"
                  subtitle="مناطق خارجية مسقوفة"
                  valueEur={Number(centsToEur(p.freiflaeche))}
                  onChange={setField("freiflaeche")}
                  suffix="/يوم"
                />
                <PriceCard
                  icon={<Building2 className="w-5 h-5" />}
                  title="Parkhaus"
                  subtitle="مواقف داخلية مغطاة بالكامل"
                  valueEur={Number(centsToEur(p.parkhaus))}
                  onChange={setField("parkhaus")}
                  suffix="/يوم"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Cleaning Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              خدمات التنظيف
            </CardTitle>
            <CardDescription>أسعار إضافية اختيارية للتنظيف</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && prices === null ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحميل...
              </div>
            ) : (
              <>
                <PriceCard
                  icon={<Sparkles className="w-5 h-5" />}
                  title="Außenreinigung"
                  subtitle="تنظيف خارجي للمركبة"
                  valueEur={Number(centsToEur(p.reinigung_aussen))}
                  onChange={setField("reinigung_aussen")}
                  min={0}
                  max={999}
                  suffix="(ثابت)"
                />
                <PriceCard
                  icon={<Sparkles className="w-5 h-5" />}
                  title="Innenreinigung"
                  subtitle="تنظيف داخلي للمركبة"
                  valueEur={Number(centsToEur(p.reinigung_innen))}
                  onChange={setField("reinigung_innen")}
                  min={0}
                  max={999}
                  suffix="(ثابت)"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {prices !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">معاينة حساب السعر</CardTitle>
            <CardDescription>كيف يُحسب إجمالي الحجز بناءً على الأسعار الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">مدة الحجز</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Freifläche</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Parkhaus</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 5, 7, 10, 14].map((days, i) => (
                    <tr key={days} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="py-2 px-3 text-right font-medium">{days} {days === 1 ? "يوم" : "أيام"}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="font-bold text-primary">
                          €{((days * p.freiflaeche) / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="font-bold text-primary">
                          €{((days * p.parkhaus) / 100).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground text-xs mb-1">+ Außenreinigung</p>
                <p className="font-bold">€{(p.reinigung_aussen / 100).toFixed(0)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground text-xs mb-1">+ Innenreinigung</p>
                <p className="font-bold">€{(p.reinigung_innen / 100).toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save & Reset */}
      <div className="flex gap-3">
        <button
          onClick={() => prices && saveMutation.mutate(prices)}
          disabled={saveMutation.isPending || prices === null}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-2.5
                     text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Save className="w-4 h-4" />}
          حفظ الأسعار على الموقع
        </button>
        <button
          onClick={() => { setPrices(null); refetch(); }}
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
          تم الحفظ — الأسعار الجديدة تظهر الآن على الموقع
        </div>
      )}
    </div>
  );
}
