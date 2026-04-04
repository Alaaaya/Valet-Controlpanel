import { Link } from "wouter";
import { useGetSettings, getGetSettingsQueryKey, useGetSections, getGetSectionsQueryKey, useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Layers, Settings, Calendar } from "lucide-react";
import { format } from "date-fns";

export function DashboardPage() {
  const { data: settings, isLoading: settingsLoading } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const { data: sections, isLoading: sectionsLoading } = useGetSections({ query: { queryKey: getGetSectionsQueryKey() } });
  const { data: health, isLoading: healthLoading } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });

  const activeSectionsCount = sections?.filter(s => s.isVisible).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">لوحة القيادة</h1>
        <p className="text-muted-foreground mt-2">
          مرحباً بك في لوحة تحكم موقع Travel Valet. من هنا يمكنك إدارة جميع أجزاء موقعك.
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
            <CardTitle className="text-sm font-medium">الأقسام المفعلة</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sectionsLoading ? (
              <Skeleton className="h-7 w-[50px]" />
            ) : (
              <div className="text-2xl font-bold">
                {activeSectionsCount} <span className="text-sm font-normal text-muted-foreground">من {sections?.length}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اسم الموقع</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <Skeleton className="h-7 w-[150px]" />
            ) : (
              <div className="text-xl font-bold truncate" title={settings?.siteName}>
                {settings?.siteName || 'غير محدد'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر تحديث للإعدادات</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <Skeleton className="h-7 w-[120px]" />
            ) : (
              <div className="text-lg font-bold">
                {settings?.updatedAt ? format(new Date(settings.updatedAt), 'yyyy/MM/dd') : 'غير معروف'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>الوصول السريع</CardTitle>
            <CardDescription>
              روابط سريعة للوصول إلى أقسام لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/settings" className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group">
              <Settings className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-accent-foreground" />
              <span className="font-medium">إعدادات الموقع</span>
            </Link>
            <Link href="/sections" className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group">
              <Layers className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-accent-foreground" />
              <span className="font-medium">إدارة الأقسام</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
