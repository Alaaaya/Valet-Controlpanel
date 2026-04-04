import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetContact, getGetContactQueryKey, useUpdateContact } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const contactSchema = z.object({
  whatsappNumber: z.string().min(1, { message: "رقم الواتساب مطلوب" }),
  whatsappMessage: z.string().min(1, { message: "رسالة الحجز مطلوبة" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  phone: z.string().min(1, { message: "رقم الهاتف مطلوب" }),
  address: z.string().min(1, { message: "العنوان مطلوب" }),
  bookingUrl: z.string().url({ message: "رابط الحجز غير صحيح" }),
  facebookUrl: z.string().url({ message: "رابط فيسبوك غير صحيح" }).optional().or(z.literal("")),
  instagramUrl: z.string().url({ message: "رابط انستغرام غير صحيح" }).optional().or(z.literal("")),
  twitterUrl: z.string().url({ message: "رابط تويتر غير صحيح" }).optional().or(z.literal("")),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialized = useRef(false);
  const [whatsappPreview, setWhatsappPreview] = useState("");

  const { data: contact, isLoading } = useGetContact({ 
    query: { queryKey: getGetContactQueryKey() } 
  });
  
  const updateContact = useUpdateContact();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      whatsappNumber: "",
      whatsappMessage: "",
      email: "",
      phone: "",
      address: "",
      bookingUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
    },
  });

  // Watch values to generate preview
  const watchWhatsappNumber = form.watch("whatsappNumber");
  const watchWhatsappMessage = form.watch("whatsappMessage");

  useEffect(() => {
    if (watchWhatsappNumber && watchWhatsappMessage) {
      // Clean number for URL
      const cleanNumber = watchWhatsappNumber.replace(/\D/g, "");
      const encodedMessage = encodeURIComponent(watchWhatsappMessage);
      setWhatsappPreview(`https://wa.me/${cleanNumber}?text=${encodedMessage}`);
    } else {
      setWhatsappPreview("");
    }
  }, [watchWhatsappNumber, watchWhatsappMessage]);

  useEffect(() => {
    if (contact && !initialized.current) {
      form.reset({
        whatsappNumber: contact.whatsappNumber,
        whatsappMessage: contact.whatsappMessage,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        bookingUrl: contact.bookingUrl,
        facebookUrl: contact.facebookUrl || "",
        instagramUrl: contact.instagramUrl || "",
        twitterUrl: contact.twitterUrl || "",
      });
      initialized.current = true;
    }
  }, [contact, form]);

  const onSubmit = (data: ContactFormValues) => {
    updateContact.mutate(
      { data },
      {
        onSuccess: (updatedData) => {
          queryClient.setQueryData(getGetContactQueryKey(), updatedData);
          toast({
            title: "تم الحفظ بنجاح",
            description: "تم تحديث معلومات التواصل بنجاح.",
          });
        },
        onError: () => {
          toast({
            title: "خطأ في الحفظ",
            description: "حدث خطأ أثناء محاولة حفظ المعلومات.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleGenerateBookingUrl = () => {
    if (whatsappPreview) {
      form.setValue("bookingUrl", whatsappPreview, { shouldValidate: true });
    }
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
        <h1 className="text-3xl font-bold tracking-tight">معلومات التواصل</h1>
        <p className="text-muted-foreground mt-2">
          إدارة أرقام الهواتف والبريد الإلكتروني وروابط التواصل الاجتماعي.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>معلومات الاتصال الأساسية</CardTitle>
              <CardDescription>
                ستظهر هذه المعلومات في قسم اتصل بنا وتذييل الموقع.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4" /> رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" className="text-left" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4" /> البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" className="text-left" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> العنوان</FormLabel>
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
              <CardTitle>الحجز عبر واتساب</CardTitle>
              <CardDescription>
                إعدادات زر الحجز الذي يوجه العميل إلى واتساب.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الواتساب (مع رمز الدولة)</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" className="text-left" placeholder="+49..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="whatsappMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رسالة الحجز الافتراضية</FormLabel>
                    <FormControl>
                      <Textarea {...field} dir="auto" placeholder="مرحباً، أود حجز خدمة..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted/50 p-4 rounded-md border border-border">
                <p className="text-sm font-medium mb-2">رابط الواتساب المتولد:</p>
                <div className="flex gap-2 items-center">
                  <Input readOnly value={whatsappPreview} dir="ltr" className="text-left bg-background opacity-70" />
                  <Button type="button" variant="secondary" onClick={handleGenerateBookingUrl}>
                    استخدام كرابط حجز
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="bookingUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الحجز الفعلي (زر احجز الآن)</FormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>روابط التواصل الاجتماعي</CardTitle>
              <CardDescription>
                أضف روابط حساباتك على وسائل التواصل الاجتماعي. اترك الحقل فارغاً لإخفاء الأيقونة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Facebook className="w-4 h-4" /> رابط فيسبوك</FormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Instagram className="w-4 h-4" /> رابط انستغرام</FormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Twitter className="w-4 h-4" /> رابط تويتر</FormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="bg-muted/50 py-4 border-t flex justify-end">
              <Button type="submit" disabled={updateContact.isPending}>
                {updateContact.isPending ? (
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
