import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, ToggleLeft, ToggleRight, Save, Loader2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type EmailSettings = {
  enabled: boolean;
  subject: string;
  reply_to: string;
};

function isValidSettings(data: unknown): data is EmailSettings {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.enabled === "boolean" && typeof d.subject === "string";
}

export function BookingEmailPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EmailSettings | null>(null);

  const { isLoading, isError } = useQuery({
    queryKey: ["booking-email"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/wp/booking-email`);
      const data = await r.json();
      if (!r.ok || !isValidSettings(data)) throw new Error("فشل تحميل الإعدادات");
      setForm(data);
      return data as EmailSettings;
    },
  });

  const mutation = useMutation({
    mutationFn: async (settings: EmailSettings) => {
      const r = await fetch(`${API_BASE}/api/wp/booking-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!r.ok) throw new Error("فشل الحفظ");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-email"] });
      toast({ title: "تم الحفظ", description: "تم حفظ إعدادات إيميل الحجز بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات — تأكد أن البلاجن v1.7.2 مثبّت", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" /> إيميل تأكيد الحجز
        </h1>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive">البلاجن غير مثبّت أو قديم</p>
            <p className="text-sm text-muted-foreground mt-1">
              هذه الميزة تحتاج إلى تثبيت البلاجن الإصدار <strong>v1.7.2</strong>.
              حمّل الإصدار الجديد ثم ثبّته في WordPress.
            </p>
          </div>
        </div>
        <a
          href={`${API_BASE}/api/wp/download-bridge-plugin`}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" /> تحميل البلاجن v1.7.2
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" /> إيميل تأكيد الحجز
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          عند الحجز، يصل إيميل تأكيد تلقائي للزبون باللغة الألمانية مع كامل التفاصيل.
        </p>
      </div>

      {/* Preview card */}
      <div className="bg-gradient-to-br from-[#0b0f1a] to-[#13192b] rounded-2xl p-6 text-white border border-[#c9a84c]/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-lg">✈️</div>
          <div>
            <div className="font-bold text-[#c9a84c] text-sm">Travel Valet Düsseldorf</div>
            <div className="text-xs text-white/50">Buchungsbestätigung</div>
          </div>
        </div>
        <div className="bg-[#c9a84c] rounded-lg px-4 py-2 text-[#0b0f1a] text-sm font-semibold mb-3">
          ✓ Buchung bestätigt! · TVD-XXXXXXXX
        </div>
        <div className="text-xs text-white/60 space-y-1">
          <div className="flex justify-between"><span>Anreise</span><span>01.06.2025 um 08:00</span></div>
          <div className="flex justify-between"><span>Abreise</span><span>08.06.2025 um 20:00</span></div>
          <div className="flex justify-between"><span>Parkart</span><span>Parkhaus</span></div>
          <div className="flex justify-between"><span>Gesamtpreis</span><span className="text-[#c9a84c] font-bold">€84,00</span></div>
        </div>
      </div>

      {/* Connected badge */}
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="w-4 h-4" />
        البلاجن v1.7.2 متصل ويعمل
      </div>

      {/* Settings form */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">تفعيل إيميل التأكيد</p>
            <p className="text-sm text-muted-foreground">أرسل إيميل تأكيد تلقائي لكل زبون بعد الحجز</p>
          </div>
          <button
            onClick={() => setForm({ ...form, enabled: !form.enabled })}
            className="transition-colors"
          >
            {form.enabled
              ? <ToggleRight className="w-10 h-10 text-primary" />
              : <ToggleLeft className="w-10 h-10 text-muted-foreground" />
            }
          </button>
        </div>

        <hr className="border-border" />

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-sm font-medium">عنوان الإيميل (Subject)</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            dir="ltr"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Reply-to */}
        <div className="space-y-2">
          <label className="text-sm font-medium">إيميل الرد (Reply-To)</label>
          <input
            type="email"
            value={form.reply_to}
            onChange={(e) => setForm({ ...form, reply_to: e.target.value })}
            dir="ltr"
            placeholder="info.travelpark24@gmail.com"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">الإيميل الذي يصله رد الزبون إذا ضغط Reply</p>
        </div>

        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold
                     hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}
