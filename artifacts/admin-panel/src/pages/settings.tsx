import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2 } from "lucide-react";

const settingsSchema = z.object({
  siteName: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  aboutTitle: z.string().min(1),
  aboutText: z.string().min(1),
  servicesTitle: z.string().min(1),
  bookingTitle: z.string().min(1),
  bookingSubtitle: z.string().min(1),
  footerText: z.string().min(1),
  metaDescription: z.string().min(1),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "",
      heroTitle: "",
      heroSubtitle: "",
      aboutTitle: "",
      aboutText: "",
      servicesTitle: "",
      bookingTitle: "",
      bookingSubtitle: "",
      footerText: "",
      metaDescription: "",
    },
  });

  // 🔥 تحميل البيانات
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // 🔥 تعبئة الفورم
  useEffect(() => {
    if (settings && !initialized.current) {
      form.reset(settings);
      initialized.current = true;
    }
  }, [settings, form]);

  // 🔥 حفظ البيانات
  const onSubmit = (data: SettingsFormValues) => {
    setIsSaving(true);

    fetch("/api/settings", {
      method: "POST", // أو PUT حسب backend
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((updatedData) => {
        setSettings(updatedData);
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم تحديث الإعدادات",
        });
      })
      .catch(() => {
        toast({
          title: "خطأ",
          description: "فشل الحفظ",
          variant: "destructive",
        });
      })
      .finally(() => setIsSaving(false));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إعدادات الموقع</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات عامة</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الموقع</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" />
                    حفظ
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