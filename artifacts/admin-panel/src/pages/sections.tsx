import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  Globe,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type LiveSection = {
  id: string;
  label: string;
  visible: boolean;
  order: number;
};

function useBridgeStatus() {
  return useQuery<{ installed: boolean }>({
    queryKey: ["bridge-status"],
    queryFn: () =>
      fetch(`${API_BASE}/api/wp/bridge-status`).then((r) => r.json()),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}

function useLiveSections() {
  return useQuery<LiveSection[]>({
    queryKey: ["live-sections"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/wp/live-sections`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.message ?? "فشل جلب الأقسام");
      const arr: LiveSection[] = Array.isArray(data.sections)
        ? data.sections
        : DEFAULT_SECTIONS;
      return [...arr].sort((a, b) => a.order - b.order);
    },
    enabled: false,
    staleTime: 30_000,
  });
}

const DEFAULT_SECTIONS: LiveSection[] = [
  { id: "home",        label: "القسم الرئيسي",                        visible: true, order: 0 },
  { id: "tvd-stats",   label: "الإحصائيات (24/7 · 5★ · 2min · 100%)", visible: true, order: 1 },
  { id: "services",   label: "الخدمات",                               visible: true, order: 2 },
  { id: "ablauf",     label: "كيف يعمل",                              visible: true, order: 3 },
  { id: "buchen",     label: "الحجز",                                 visible: true, order: 4 },
  { id: "parkingpro", label: "احجز الآن - ParkingPro",               visible: true, order: 5 },
  { id: "ueber-uns",  label: "من نحن",                                visible: true, order: 6 },
  { id: "kontakt",    label: "تواصل معنا",                            visible: true, order: 7 },
];

function SetupInstructions({ onDownload }: { onDownload: () => void }) {
  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900 dark:text-amber-200">
            مطلوب: تثبيت إضافة الربط
          </CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          أقسام موقعك مكتوبة في كود القالب مباشرة. للتحكم بها من هنا، يجب تثبيت
          إضافة صغيرة على WordPress مرة واحدة فقط.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3">
          {[
            {
              num: "١",
              text: "حمّل ملف الإضافة (ZIP) بالضغط على الزر أدناه",
            },
            {
              num: "٢",
              text: 'افتح لوحة WordPress ثم اذهب إلى: الإضافات ← إضافة جديدة ← رفع إضافة',
            },
            {
              num: "٣",
              text: "ارفع الملف واضغط \"تثبيت الآن\"، ثم \"تفعيل\"",
            },
            {
              num: "٤",
              text: 'ارجع إلى هذه الصفحة واضغط "تحقق من التثبيت"',
            },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 font-bold text-sm">
                {step.num}
              </span>
              <p className="text-sm text-amber-800 dark:text-amber-300 pt-1">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={onDownload}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            <Download className="h-4 w-4" />
            تحميل إضافة الربط (ZIP)
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://xn--traveldsseldorf-5vb.de/wp-admin/plugin-install.php?tab=upload"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              فتح صفحة رفع الإضافات في WordPress
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveSectionsList() {
  const { toast } = useToast();
  const [sections, setSections] = useState<LiveSection[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { refetch, isFetching } = useQuery<LiveSection[]>({
    queryKey: ["live-sections"],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/wp/live-sections`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.message ?? "فشل جلب الأقسام");
      const fetched: LiveSection[] = Array.isArray(data.sections)
        ? data.sections
        : DEFAULT_SECTIONS;
      // Merge in any DEFAULT_SECTIONS missing from the fetched list
      const fetchedIds = fetched.map((s) => s.id);
      const missing = DEFAULT_SECTIONS.filter((d) => !fetchedIds.includes(d.id)).map(
        (d, i) => ({ ...d, order: fetched.length + i })
      );
      const merged = [...fetched, ...missing];
      const sorted = merged.sort((a, b) => a.order - b.order);
      setSections(sorted);
      setHasLoaded(true);
      return sorted;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const saveMutation = useMutation({
    mutationFn: async (newSections: LiveSection[]) => {
      const r = await fetch(`${API_BASE}/api/wp/live-sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: newSections }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.message ?? "فشل الحفظ");
      }
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "تم الحفظ", description: "تم تحديث أقسام الموقع." });
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const save = async (next: LiveSection[]) => {
    setIsSaving(true);
    setSections(next);
    await saveMutation.mutateAsync(next);
    setIsSaving(false);
  };

  const moveUp = (index: number) => {
    if (index === 0 || isSaving) return;
    const next = [...sections];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    save(reordered);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1 || isSaving) return;
    const next = [...sections];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    save(reordered);
  };

  const toggleVisible = (id: string) => {
    const next = sections.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    save(next);
  };

  if (!hasLoaded || isFetching) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        جاري تحميل أقسام الموقع...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex justify-between items-center">
        {isSaving ? (
          <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري الحفظ على الموقع...
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            اضغط <span className="font-bold text-foreground">▲ للأعلى</span> أو{" "}
            <span className="font-bold text-foreground">▼ للأسفل</span> لتغيير الترتيب
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {sections.map((section, index) => (
        <div
          key={section.id}
          className={`border rounded-xl bg-card shadow-sm transition-all ${
            isSaving ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {/* Main row */}
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Position badge */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
              {index + 1}
            </span>

            {/* Section name */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base leading-tight">{section.label}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">
                #{section.id}
              </p>
            </div>

            {/* Visibility toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {section.visible ? (
                <span className="text-xs text-green-600 font-medium">ظاهر</span>
              ) : (
                <span className="text-xs text-muted-foreground font-medium">مخفي</span>
              )}
              <Switch
                checked={section.visible}
                onCheckedChange={() => toggleVisible(section.id)}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Move buttons row */}
          <div className="flex border-t divide-x divide-x-reverse">
            <Button
              variant="ghost"
              className="flex-1 rounded-none rounded-br-xl h-10 gap-2 text-sm font-medium
                         disabled:opacity-30"
              onClick={() => moveUp(index)}
              disabled={index === 0 || isSaving}
            >
              <ChevronUp className="h-4 w-4" />
              تحريك للأعلى
            </Button>
            <Button
              variant="ghost"
              className="flex-1 rounded-none rounded-bl-xl h-10 gap-2 text-sm font-medium
                         disabled:opacity-30"
              onClick={() => moveDown(index)}
              disabled={index === sections.length - 1 || isSaving}
            >
              <ChevronDown className="h-4 w-4" />
              تحريك للأسفل
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionsPage() {
  const { data: bridgeStatus, isLoading: statusLoading, refetch: refetchStatus } =
    useBridgeStatus();
  const { toast } = useToast();

  const handleDownload = () => {
    window.open(`${API_BASE}/api/wp/download-bridge-plugin`, "_blank");
  };

  const handleCheckInstallation = async () => {
    const result = await refetchStatus();
    if (result.data?.installed) {
      toast({
        title: "تم التثبيت بنجاح!",
        description: "إضافة الربط نشطة وجاهزة.",
      });
    } else {
      toast({
        title: "لم يتم التثبيت بعد",
        description: "تأكد من رفع الإضافة وتفعيلها في WordPress.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إدارة أقسام الموقع</h1>
        <p className="text-muted-foreground mt-2">
          تحكم في ترتيب وظهور أقسام الموقع على{" "}
          <a
            href="https://xn--traveldsseldorf-5vb.de"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-primary"
          >
            traveldüsseldorf.de
          </a>
          .
        </p>
      </div>

      {/* Status card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">حالة الاتصال بـ WordPress</CardTitle>
            </div>
            {statusLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : bridgeStatus?.installed ? (
              <Badge
                variant="outline"
                className="border-green-500 text-green-600 gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                متصل ومفعّل
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500 text-amber-600 gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                الإضافة غير مثبتة
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-3">
            {!statusLoading && !bridgeStatus?.installed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckInstallation}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                تحقق من التثبيت
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              {bridgeStatus?.installed ? "تحميل آخر إصدار من الإضافة" : "تحميل الإضافة (ZIP)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Show setup instructions if not installed */}
      {!statusLoading && !bridgeStatus?.installed && (
        <SetupInstructions onDownload={handleDownload} />
      )}

      {/* Show live controls if installed */}
      {!statusLoading && bridgeStatus?.installed && (
        <Card>
          <CardHeader>
            <CardTitle>ترتيب وظهور الأقسام</CardTitle>
            <CardDescription>
              التغييرات تُطبَّق مباشرة على الموقع الحي. استخدم الأسهم لتغيير
              الترتيب أو فعّل/عطّل ظهور القسم.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LiveSectionsList />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
