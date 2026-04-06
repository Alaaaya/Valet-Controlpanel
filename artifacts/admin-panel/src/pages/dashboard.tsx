import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Globe, FileText, BookOpen, ExternalLink } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface WpSettings {
  title: string;
  description: string;
  url: string;
  email: string;
}

export function DashboardPage() {
  const [wpSettings, setWpSettings] = useState<WpSettings | null>(null);
  const [pagesCount, setPagesCount] = useState<number | null>(null);
  const [postsCount, setPostsCount] = useState<number | null>(null);
  const [health, setHealth] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);

  // ✅ health check بدل hook
  useEffect(() => {
    fetch("/api/healthz")
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setHealthLoading(false);
      })
      .catch(() => setHealthLoading(false));
  }, []);

  // ✅ باقي البيانات
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, pagesRes, postsRes] = await Promise.all([
          fetch(`${BASE}/api/wp/settings`),
          fetch(`${BASE}/api/wp/pages`),
          fetch(`${BASE}/api/wp/posts`),
        ]);

        const settings = await settingsRes.json();
        const pages = await pagesRes.json();
        const posts = await postsRes.json();

        setWpSettings(settings);
        setPagesCount(Array.isArray(pages) ? pages.length : 0);
        setPostsCount(Array.isArray(posts) ? posts.length : 0);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة القيادة</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card>
          <CardHeader>
            <CardTitle>حالة النظام</CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-6 w-[100px]" />
            ) : (
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${health?.status === "ok" ? "bg-green-500" : "bg-red-500"}`} />
                {health?.status === "ok" ? "متصل" : "غير متصل"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اسم الموقع</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-[120px]" /> : wpSettings?.title}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الصفحات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-[50px]" /> : pagesCount}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المنشورات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-[50px]" /> : postsCount}
          </CardContent>
        </Card>

      </div>

      {wpSettings && (
        <Card>
          <CardHeader>
            <CardTitle>معلومات الموقع</CardTitle>
            <CardDescription>WordPress</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{wpSettings.title}</p>
            <p className="text-sm text-muted-foreground">{wpSettings.description}</p>

            <a href={wpSettings.url} target="_blank">
              زيارة الموقع <ExternalLink className="inline w-3" />
            </a>

            <p className="text-sm mt-2">
              {wpSettings.email}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/wp-settings">الإعدادات</Link>
        <Link href="/wp-pages">الصفحات</Link>
        <Link href="/wp-posts">المدونة</Link>
      </div>
    </div>
  );
}