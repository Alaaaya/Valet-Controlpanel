import { Link, useLocation } from "wouter";
import { LayoutDashboard, Settings, Layers, Phone, Palette, Plane, Globe, FileText, BookOpen, Puzzle, Car, Image, LogOut, X, Mail } from "lucide-react";
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
      { name: "إيميل الحجز", href: "/booking-email", icon: Mail },
    ],
  },
];

type NavItem = { name: string; href: string; icon: React.ElementType };
type NavGroup = { group: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "group" in entry;
}

function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-3 md:py-2.5 rounded-md transition-colors text-sm font-medium",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
      )}
    >
      <item.icon className={cn("w-5 h-5 md:w-4 md:h-4 ml-3", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50")} />
      {item.name}
    </Link>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { username, logout } = useAuth();

  const handleNavClick = () => {
    onClose?.();
  };

  const sidebarContent = (
    <div className="w-72 md:w-64 bg-sidebar text-sidebar-foreground border-l border-sidebar-border h-full flex flex-col shadow-lg shadow-sidebar/20">
      <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border bg-sidebar/50 flex-shrink-0">
        <div className="flex items-center">
          <Plane className="w-6 h-6 text-primary ml-3" />
          <h1 className="text-lg font-bold tracking-wide">Travel Valet</h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navigation.map((entry) => {
          if (!isGroup(entry)) {
            return (
              <NavLink
                key={entry.href}
                item={entry as NavItem}
                isActive={location === (entry as NavItem).href}
                onClick={handleNavClick}
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
                    onClick={handleNavClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1 flex-shrink-0">
        {username && (
          <p className="px-3 text-xs text-sidebar-foreground/40 truncate">{username}</p>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium
                     text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="w-4 h-4 ml-3" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" dir="rtl">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer (slides from right in RTL) */}
          <div className="relative flex-shrink-0">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
