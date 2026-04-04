import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu, Plane } from "lucide-react";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  "/": "لوحة القيادة",
  "/settings": "إعدادات الموقع",
  "/sections": "إدارة الأقسام",
  "/contact": "معلومات التواصل",
  "/colors": "ألوان الموقع",
  "/logo": "شعار الموقع",
  "/pricing": "أسعار الحجز",
  "/booking-email": "إيميل الحجز",
  "/wp-settings": "إعدادات WordPress",
  "/wp-pages": "صفحات الموقع",
  "/wp-posts": "مدونة WordPress",
  "/plugins": "إضافات الموقع",
  "/parkingpro": "ParkingPro",
};

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const pageTitle = PAGE_TITLES[location] ?? "لوحة التحكم";

  return (
    <div className="flex min-h-screen bg-background text-foreground" dir="rtl">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top header */}
        <header className="md:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-card flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{pageTitle}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
