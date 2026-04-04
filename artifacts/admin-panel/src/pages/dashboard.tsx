import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Globe, FileText, BookOpen, ExternalLink, Settings } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);

  const { data: health, isLoading: healthLoading } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });

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
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">لوحة القيادة</h1>
        <p className="text-muted-foreground mt-2">
          مرحباً بك في لوحة تحكم موقع Travel Valet. من هنا يمكنك إدارة جميع أجزاء موقعك على WordPress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-7 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold flex items-center gap-2">
                <span className={`flex h-3 w-3 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                {health?.status === 'ok' ? 'متصل' : 'غير متصل'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اسم الموقع</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-[150px]" />
            ) : (
              <div className="text-lg font-bold truncate" title={wpSettings?.title}>
                {wpSettings?.title || 'غير محدد'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صفحات WordPress</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-[50px]" />
            ) : (
              <div className="text-2xl font-bold">
                {pagesCount ?? 0}
                <span className="text-sm font-normal text-muted-foreground mr-1">صفحة</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">منشورات المدونة</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-[50px]" />
            ) : (
              <div className="text-2xl font-bold">
                {postsCount ?? 0}
                <span className="text-sm font-normal text-muted-foreground mr-1">منشور</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {wpSettings && (
        <Card>
          <CardHeader>
            <CardTitle>معلومات الموقع</CardTitle>
            <CardDescription>بيانات حية من WordPress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium">{wpSettings.title}</p>
                <p className="text-sm text-muted-foreground">{wpSettings.description}</p>
              </div>
              <a
                href={wpSettings.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                زيارة الموقع
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              البريد الإلكتروني: <span className="text-foreground font-medium" dir="ltr">{wpSettings.email}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/wp-settings" className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group">
          <Globe className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-accent-foreground" />
          <span className="font-medium">إعدادات WordPress</span>
        </Link>
        <Link href="/wp-pages" className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group">
          <FileText className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-accent-foreground" />
          <span className="font-medium">صفحات الموقع</span>
        </Link>
        <Link href="/wp-posts" className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group">
          <BookOpen className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-accent-foreground" />
          <span className="font-medium">مدونة WordPress</span>
        </Link>
      </div>
    </div>
  );
}
