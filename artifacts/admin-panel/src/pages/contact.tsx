import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const contactSchema = z.object({
  whatsappNumber: z.string().min(1),
  whatsappMessage: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  bookingUrl: z.string().url(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { toast } = useToast();
  const initialized = useRef(false);

  const [contact, setContact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [whatsappPreview, setWhatsappPreview] = useState("");

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

  // تحميل البيانات
  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => {
        setContact(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // تعبئة الفورم
  useEffect(() => {
    if (contact && !initialized.current) {
      form.reset(contact);
      initialized.current = true;
    }
  }, [contact, form]);

  // preview واتساب
  const watchWhatsappNumber = form.watch("whatsappNumber");
  const watchWhatsappMessage = form.watch("whatsappMessage");

  useEffect(() => {
    if (watchWhatsappNumber && watchWhatsappMessage) {
      const clean = watchWhatsappNumber.replace(/\D/g, "");
      const msg = encodeURIComponent(watchWhatsappMessage);
      setWhatsappPreview(`https://wa.me/${clean}?text=${msg}`);
    }
  }, [watchWhatsappNumber, watchWhatsappMessage]);

  // حفظ
  const onSubmit = (data: ContactFormValues) => {
    setIsSaving(true);

    fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((updated) => {
        setContact(updated);
        toast({
          title: "تم الحفظ",
          description: "تم تحديث معلومات التواصل",
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
      <h1 className="text-3xl font-bold">معلومات التواصل</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>معلومات أساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel><Phone className="inline w-4" /> الهاتف</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel><Mail className="inline w-4" /> الإيميل</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel><MapPin className="inline w-4" /> العنوان</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>واتساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم واتساب</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="whatsappMessage" render={({ field }) => (
                <FormItem>
                  <FormLabel>الرسالة</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                </FormItem>
              )} />

              <Input readOnly value={whatsappPreview} />

              <Button type="button" onClick={() => form.setValue("bookingUrl", whatsappPreview)}>
                استخدام كرابط حجز
              </Button>

            </CardContent>
          </Card>

          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  جاري الحفظ
                </>
              ) : (
                <>
                  <Save className="mr-2" />
                  حفظ
                </>
              )}
            </Button>
          </CardFooter>

        </form>
      </Form>
    </div>
  );
}