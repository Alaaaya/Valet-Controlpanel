import { Link, useLocation } from "wouter";
import { LayoutDashboard, Settings, Layers, Phone, Palette, Plane, Globe, FileText, BookOpen, Puzzle, Car, Image, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "لوحة القيادة", href: "/", icon: LayoutDashboard },
  {
    group: "WordPress",
    items: [
      { name: "إعدادات WordPress", href: "/wp-settings", icon: Globe },
      { name: "صفحات الموقع", href: "/wp-pages", icon: FileText },
      { name: "مدونة WordPress", href: "/wp-posts", icon: BookOpen },
      { name: "إضافات الموقع", href: "/plugins", icon: Puzzle },
      { name: "ParkingPro", href: "/parkingpro", icon: Car },
    ],
  },
  {
    group: "الإعدادات المحلية",
    items: [
      { name: "إعدادات الموقع", href: "/settings", icon: Settings },
      { name: "إدارة الأقسام", href: "/sections", icon: Layers },
      { name: "معلومات التواصل", href: "/contact", icon: Phone },
      { name: "ألوان الموقع", href: "/colors", icon: Palette },
      { name: "شعار الموقع", href: "/logo", icon: Image },
    ],
  },
];

type NavItem = { name: string; href: string; icon: React.ElementType };
type NavGroup = { group: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "group" in entry;
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      key={item.name}
      href={item.href}
      className={cn(
        "flex items-center px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
      )}
    >
      <item.icon className={cn("w-4 h-4 ml-3", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50")} />
      {item.name}
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { username, logout } = useAuth();

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground border-l border-sidebar-border min-h-screen flex flex-col shadow-lg shadow-sidebar/20">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar/50">
        <Plane className="w-6 h-6 text-primary ml-3" />
        <h1 className="text-lg font-bold tracking-wide">Travel Valet</h1>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navigation.map((entry) => {
          if (!isGroup(entry)) {
            return (
              <NavLink
                key={entry.href}
                item={entry as NavItem}
                isActive={location === (entry as NavItem).href}
              />
            );
          }
          const group = entry as NavGroup;
          return (
            <div key={group.group} className="pt-3">
              <p className="px-3 pb-1 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={location === item.href}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {username && (
          <p className="px-3 text-xs text-sidebar-foreground/40 truncate">{username}</p>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium
                     text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="w-4 h-4 ml-3" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
