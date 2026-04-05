import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Euro, Save, Loader2, CheckCircle2, RefreshCw, Car, Building2, Sparkles, Info, CalendarDays } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "");

interface BookingPrices {
  freiflaeche_d1: number;
  freiflaeche_d2: number;
  freiflaeche_d3: number;
  parkhaus_d1: number;
  parkhaus_d2: number;
  parkhaus_d3: number;
  reinigung_aussen: number;
  reinigung_innen: number;
}

const DEFAULTS: BookingPrices = {
  freiflaeche_d1: 1200,
  freiflaeche_d2: 1200,
  freiflaeche_d3: 1200,
  parkhaus_d1: 1500,
  parkhaus_d2: 1500,
  parkhaus_d3: 1500,
  reinigung_aussen: 4000,
  reinigung_innen: 7000,
};

function centsToEur(cents: number) {
  return (cents / 100).toFixed(0);
}
function eurToCents(eur: number) {
  return Math.round(eur * 100);
}

function calcTotal(days: number, d1: number, d2: number, d3: number): number {
  if (days <= 0) return 0;
  if (days === 1) return d1;
  if (days === 2) return d1 + d2;
  return d1 + d2 + (days - 2) * d3;
}

interface DayPriceRowProps {
  label: string;
  valueEur: number;
  onChange: (eur: number) => void;
  dayLabel: string;
  color?: string;
}

function DayPriceRow({ label, valueEur, onChange, dayLabel, color = "text-primary" }: DayPriceRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors">
      <div className={`text-xs font-semibold ${color} w-24 shrink-0 text-right`}>{dayLabel}</div>
      <div className="flex-1 text-xs text-muted-foreground truncate">{label}</div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-sm font-bold text-primary">€</span>
        <input
          type="number"
          min={1}
          max={999}
          value={valueEur}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= 1 && v <= 999) onChange(v);
          }}
          className="w-16 text-center rounded-lg border border-border bg-background px-2 py-1
                     text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs text-muted-foreground w-8">/يوم</span>
      </div>
    </div>
  );
}

interface CleanPriceRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  valueEur: number;
  onChange: (eur: number) => void;
}

function CleanPriceRow({ icon, title, subtitle, valueEur, onChange }: CleanPriceRowProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-lg font-bold text-primary">€</span>
        <input
          type="number"
          min={0}
          max={999}
          value={valueEur}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= 0 && v <= 999) onChange(v);
          }}
          className="w-16 text-center rounded-lg border border-border bg-background px-2 py-1.5
                     text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-xs text-muted-foreground w-12">(ثابت)</span>
      </div>
    </div>
  );
}

function normalizePrices(raw: Record<string, number>): BookingPrices {
  const ff = raw.freiflaeche ?? DEFAULTS.freiflaeche_d1;
  const ph = raw.parkhaus ?? DEFAULTS.parkhaus_d1;
  return {
    freiflaeche_d1: raw.freiflaeche_d1 ?? ff,
    freiflaeche_d2: raw.freiflaeche_d2 ?? ff,
    freiflaeche_d3: raw.freiflaeche_d3 ?? ff,
    parkhaus_d1: raw.parkhaus_d1 ?? ph,
    parkhaus_d2: raw.parkhaus_d2 ?? ph,
    parkhaus_d3: raw.parkhaus_d3 ?? ph,
    reinigung_aussen: raw.reinigung_aussen ?? DEFAULTS.reinigung_aussen,
    reinigung_innen: raw.reinigung_innen ?? DEFAULTS.reinigung_innen,
  };
}

export function PricingPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [prices, setPrices] = useState<BookingPrices | null>(null);

  const { data, isLoading, refetch } = useQuery<Record<string, number>>({
    queryKey: ["booking-prices"],
    queryFn: () => fetch(`${API_BASE}/api/wp/booking-prices`).then((r) => r.json()),
    staleTime: 0,
  });

  useEffect(() => {
    if (data && prices === null) {
      setPrices(normalizePrices(data));
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

  const ffD1 = p.freiflaeche_d1, ffD2 = p.freiflaeche_d2, ffD3 = p.freiflaeche_d3;
  const phD1 = p.parkhaus_d1, phD2 = p.parkhaus_d2, phD3 = p.parkhaus_d3;

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
        {/* Freifläche */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="w-5 h-5 text-primary" />
              Freifläche
            </CardTitle>
            <CardDescription>مناطق خارجية مسقوفة — سعر كل يوم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && prices === null ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />جاري التحميل...
              </div>
            ) : (
              <>
                <DayPriceRow
                  dayLabel="اليوم الأول"
                  label="سعر اليوم 1"
                  valueEur={Number(centsToEur(ffD1))}
                  onChange={setField("freiflaeche_d1")}
                  color="text-green-600"
                />
                <DayPriceRow
                  dayLabel="اليوم الثاني"
                  label="سعر اليوم 2"
                  valueEur={Number(centsToEur(ffD2))}
                  onChange={setField("freiflaeche_d2")}
                  color="text-blue-600"
                />
                <DayPriceRow
                  dayLabel="اليوم 3 فما فوق"
                  label="سعر كل يوم إضافي"
                  valueEur={Number(centsToEur(ffD3))}
                  onChange={setField("freiflaeche_d3")}
                  color="text-purple-600"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Parkhaus */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5 text-primary" />
              Parkhaus
            </CardTitle>
            <CardDescription>مواقف داخلية مغطاة بالكامل — سعر كل يوم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && prices === null ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />جاري التحميل...
              </div>
            ) : (
              <>
                <DayPriceRow
                  dayLabel="اليوم الأول"
                  label="سعر اليوم 1"
                  valueEur={Number(centsToEur(phD1))}
                  onChange={setField("parkhaus_d1")}
                  color="text-green-600"
                />
                <DayPriceRow
                  dayLabel="اليوم الثاني"
                  label="سعر اليوم 2"
                  valueEur={Number(centsToEur(phD2))}
                  onChange={setField("parkhaus_d2")}
                  color="text-blue-600"
                />
                <DayPriceRow
                  dayLabel="اليوم 3 فما فوق"
                  label="سعر كل يوم إضافي"
                  valueEur={Number(centsToEur(phD3))}
                  onChange={setField("parkhaus_d3")}
                  color="text-purple-600"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Cleaning */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-amber-500" />
              خدمات التنظيف
            </CardTitle>
            <CardDescription>أسعار إضافية اختيارية — تُضاف مرة واحدة للإجمالي</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && prices === null ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />جاري التحميل...
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <CleanPriceRow
                  icon={<Sparkles className="w-4 h-4" />}
                  title="Außenreinigung"
                  subtitle="تنظيف خارجي للمركبة"
                  valueEur={Number(centsToEur(p.reinigung_aussen))}
                  onChange={setField("reinigung_aussen")}
                />
                <CleanPriceRow
                  icon={<Sparkles className="w-4 h-4" />}
                  title="Innenreinigung"
                  subtitle="تنظيف داخلي للمركبة"
                  valueEur={Number(centsToEur(p.reinigung_innen))}
                  onChange={setField("reinigung_innen")}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      {prices !== null && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="w-4 h-4" />
              معاينة حساب السعر (بدون تنظيف)
            </CardTitle>
            <CardDescription>إجمالي الموقف حسب عدد الأيام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">أيام</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Freifläche</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Parkhaus</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 7, 10, 14].map((days, i) => (
                    <tr key={days} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="py-2 px-3 text-right font-medium">{days} {days === 1 ? "يوم" : "أيام"}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="font-bold text-primary">
                          €{(calcTotal(days, ffD1, ffD2, ffD3) / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="font-bold text-primary">
                          €{(calcTotal(days, phD1, phD2, phD3) / 100).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground text-xs mb-1">+ Außenreinigung (اختياري)</p>
                <p className="font-bold">€{(p.reinigung_aussen / 100).toFixed(0)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground text-xs mb-1">+ Innenreinigung (اختياري)</p>
                <p className="font-bold">€{(p.reinigung_innen / 100).toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save */}
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
          تم الحفظ — بعد التحديث (Ctrl+Shift+R) ستظهر الأسعار الجديدة على الموقع
        </div>
      )}
    </div>
  );
}
