import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2, ExternalLink, Globe } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface WpSettings {
  title: string;
  description: string;
  url: string;
  email: string;
  timezone: string;
  date_format: string;
  time_format: string;
  posts_per_page: number;
  show_on_front: string;
}

const schema = z.object({
  title: z.string().min(1, "اسم الموقع مطلوب"),
  description: z.string(),
  email: z.string().email("بريد إلكتروني غير صالح").or(z.literal("")),
  posts_per_page: z.coerce.number().min(1).max(100),
});

type FormValues = z.infer<typeof schema>;

export function WpSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [wpData, setWpData] = useState<WpSettings | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", email: "", posts_per_page: 10 },
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE}/api/wp/settings`);
        const data: WpSettings = await res.json();
        setWpData(data);
        form.reset({
          title: data.title,
          description: data.description,
          email: data.email,
          posts_per_page: data.posts_per_page,
        });
      } catch {
        toast({ title: "خطأ", description: "تعذّر تحميل إعدادات WordPress", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${BASE}/api/wp/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      const updated: WpSettings = await res.json();
      setWpData(updated);
      toast({ title: "تم الحفظ", description: "تم تحديث إعدادات WordPress بنجاح." });
    } catch {
      toast({ title: "خطأ", description: "تعذّر حفظ الإعدادات.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إعدادات WordPress</h1>
          <p className="text-muted-foreground mt-2">
            تعديل مباشر على موقع WordPress الخاص بك.
          </p>
        </div>
        {wpData?.url && (
          <a
            href={wpData.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-visit-site"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border rounded-md px-3 py-2"
          >
            <Globe className="h-4 w-4" />
            زيارة الموقع
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الموقع الأساسية</CardTitle>
              <CardDescription>
                هذه المعلومات تظهر في WordPress مباشرة وتؤثر على محركات البحث.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الموقع (Site Title)</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" data-testid="input-site-title" placeholder="Travel Valet Düsseldorf" />
                    </FormControl>
                    <FormDescription>يظهر في شريط المتصفح وفي نتائج البحث.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الموقع (Tagline)</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" data-testid="input-site-description" placeholder="خدمة فاليه السفر في دوسلدورف" />
                    </FormControl>
                    <FormDescription>وصف مختصر يظهر تحت اسم الموقع في بعض القوالب.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني للإدارة</FormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" type="email" data-testid="input-admin-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="posts_per_page"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد المنشورات في الصفحة</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} max={100} dir="ltr" data-testid="input-posts-per-page" className="w-24" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="bg-muted/50 py-4 border-t flex justify-end">
              <Button type="submit" disabled={isSaving} data-testid="button-save-wp-settings">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الحفظ على WordPress...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ على WordPress
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
