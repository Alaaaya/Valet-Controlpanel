import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSettings, getGetSettingsQueryKey, useUpdateSettings } from "@workspace/api-client-react";
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
  siteName: z.string().min(1, { message: "اسم الموقع مطلوب" }),
  heroTitle: z.string().min(1, { message: "العنوان الرئيسي مطلوب" }),
  heroSubtitle: z.string().min(1, { message: "العنوان الفرعي مطلوب" }),
  aboutTitle: z.string().min(1, { message: "عنوان قسم من نحن مطلوب" }),
  aboutText: z.string().min(1, { message: "نص من نحن مطلوب" }),
  servicesTitle: z.string().min(1, { message: "عنوان قسم الخدمات مطلوب" }),
  bookingTitle: z.string().min(1, { message: "عنوان قسم الحجز مطلوب" }),
  bookingSubtitle: z.string().min(1, { message: "النص الفرعي لقسم الحجز مطلوب" }),
  footerText: z.string().min(1, { message: "نص التذييل مطلوب" }),
  metaDescription: z.string().min(1, { message: "وصف الميتا مطلوب لمحركات البحث" }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  const { data: settings, isLoading } = useGetSettings({ 
    query: { queryKey: getGetSettingsQueryKey() } 
  });
  
  const updateSettings = useUpdateSettings();

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

  useEffect(() => {
    if (settings && !initialized.current) {
      form.reset({
        siteName: settings.siteName,
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        aboutTitle: settings.aboutTitle,
        aboutText: settings.aboutText,
        servicesTitle: settings.servicesTitle,
        bookingTitle: settings.bookingTitle,
        bookingSubtitle: settings.bookingSubtitle,
        footerText: settings.footerText,
        metaDescription: settings.metaDescription,
      });
      initialized.current = true;
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings.mutate(
      { data },
      {
        onSuccess: (updatedData) => {
          queryClient.setQueryData(getGetSettingsQueryKey(), updatedData);
          toast({
            title: "تم الحفظ بنجاح",
            description: "تم تحديث إعدادات الموقع بنجاح.",
          });
        },
        onError: () => {
          toast({
            title: "خطأ في الحفظ",
            description: "حدث خطأ أثناء محاولة حفظ الإعدادات.",
            variant: "destructive",
          });
        },
      }
    );
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات الموقع</h1>
        <p className="text-muted-foreground mt-2">
          إدارة النصوص والعناوين الرئيسية في موقعك.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات عامة</CardTitle>
              <CardDescription>
                المعلومات الأساسية للموقع ووصف محركات البحث.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الموقع</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الموقع (SEO)</FormLabel>
                    <FormControl>
                      <Textarea {...field} dir="auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>القسم الرئيسي (Hero)</CardTitle>
              <CardDescription>
                الواجهة الأولى التي تظهر للزوار عند فتح الموقع.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="heroTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان الرئيسي</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان الفرعي</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نصوص الأقسام</CardTitle>
              <CardDescription>
                عناوين ونصوص الأقسام المختلفة في الموقع.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="aboutTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان قسم من نحن</FormLabel>
                      <FormControl>
                        <Input {...field} dir="auto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="servicesTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان قسم الخدمات</FormLabel>
                      <FormControl>
                        <Input {...field} dir="auto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="aboutText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص من نحن</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} dir="auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bookingTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان قسم الحجز</FormLabel>
                      <FormControl>
                        <Input {...field} dir="auto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bookingSubtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>النص الفرعي لقسم الحجز</FormLabel>
                      <FormControl>
                        <Input {...field} dir="auto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="footerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص التذييل (Footer)</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="bg-muted/50 py-4 border-t flex justify-end">
              <Button type="submit" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4 ml-2" />
                    حفظ التغييرات
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
