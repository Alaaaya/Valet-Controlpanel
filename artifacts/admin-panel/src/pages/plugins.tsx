import { Download, ExternalLink, Puzzle, CheckCircle, Info } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "");

function PluginCard({
  name,
  description,
  version,
  downloadHref,
  wpAdminUrl,
  badge,
}: {
  name: string;
  description: string;
  version: string;
  downloadHref: string;
  wpAdminUrl: string;
  badge?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Puzzle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base">{name}</h3>
            <span className="text-xs text-muted-foreground">الإصدار {version}</span>
          </div>
        </div>
        {badge && (
          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 font-medium">
            {badge}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-700 space-y-1">
          <p className="font-semibold">طريقة التثبيت:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>حمّل ملف الإضافة (الزر أدناه)</li>
            <li>
              افتح{" "}
              <a
                href={wpAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                WordPress Admin ← الإضافات ← إضافة جديدة
              </a>
            </li>
            <li>اضغط «رفع إضافة» واختر الملف المحمَّل</li>
            <li>اضغط «تثبيت الآن» ثم «تفعيل»</li>
          </ol>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <a
          href={downloadHref}
          download
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          تحميل الإضافة
        </a>
        <a
          href={wpAdminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          فتح WordPress Admin
        </a>
      </div>
    </div>
  );
}

export function PluginsPage() {
  const wpAdmin = "https://xn--traveldsseldorf-5vb.de/wp-admin/plugin-install.php?tab=upload";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-end space-y-1">
        <h1 className="text-3xl font-bold">إضافات الموقع</h1>
        <p className="text-muted-foreground text-sm">حمّل وثبّت الإضافات المطلوبة على WordPress</p>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-800">
          موقعك يعمل على <strong>WordPress</strong> — جميع الإضافات تُثبَّت بشكل عادي من لوحة الإدارة
        </p>
      </div>

      <PluginCard
        name="ParkingPro Booking Widgets"
        description="ويدجت الحجز الخاص بـ ParkingPro — يتيح لزوار الموقع حجز مواقف السيارات مباشرة من صفحتك. أرسلته لك شركة ParkingPro."
        version="1.2.50"
        downloadHref={`${API_BASE}/api/wp/download-parkingpro-plugin`}
        wpAdminUrl={wpAdmin}
        badge="جاهز للتثبيت"
      />

      <PluginCard
        name="TVD Admin Bridge"
        description="إضافة الربط بين لوحة التحكم والموقع — تتيح إدارة الأقسام وترتيبها وإخفاءها والشعار وقسم ParkingPro من هذه اللوحة مباشرة."
        version="1.5.0"
        downloadHref={`${API_BASE}/api/wp/download-bridge-plugin`}
        wpAdminUrl={wpAdmin}
        badge="⬆ تحديث مطلوب"
      />
    </div>
  );
}
