import { Link, useLocation } from "wouter";
import { LayoutDashboard, Settings, Layers, Phone, Palette, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "لوحة القيادة", href: "/", icon: LayoutDashboard },
  { name: "إعدادات الموقع", href: "/settings", icon: Settings },
  { name: "إدارة الأقسام", href: "/sections", icon: Layers },
  { name: "معلومات التواصل", href: "/contact", icon: Phone },
  { name: "ألوان الموقع", href: "/colors", icon: Palette },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground border-l border-sidebar-border min-h-screen flex flex-col shadow-lg shadow-sidebar/20">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar/50">
        <Plane className="w-6 h-6 text-primary ml-3" />
        <h1 className="text-lg font-bold tracking-wide">Travel Valet</h1>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-3 rounded-md transition-colors text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
              )}
            >
              <item.icon className={cn("w-5 h-5 ml-3", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/40 text-center">
        لوحة تحكم Travel Valet
      </div>
    </div>
  );
}
