import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetColors, getGetColorsQueryKey, useUpdateColors } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2 } from "lucide-react";

// Regex for HEX color validation
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const colorsSchema = z.object({
  primaryColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح (مثال: #FF0000)"),
  secondaryColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
  accentColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
  backgroundColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
  textColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
  headerBgColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
  footerBgColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
  buttonColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
  buttonTextColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
  linkColor: z.string().regex(hexColorRegex, "الرجاء إدخال كود لون صحيح"),
});

type ColorsFormValues = z.infer<typeof colorsSchema>;

export function ColorsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  const { data: colors, isLoading } = useGetColors({ 
    query: { queryKey: getGetColorsQueryKey() } 
  });
  
  const updateColors = useUpdateColors();

  const form = useForm<ColorsFormValues>({
    resolver: zodResolver(colorsSchema),
    defaultValues: {
      primaryColor: "#000000",
      secondaryColor: "#000000",
      accentColor: "#000000",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      headerBgColor: "#ffffff",
      footerBgColor: "#000000",
      buttonColor: "#000000",
      buttonTextColor: "#ffffff",
      linkColor: "#000000",
    },
  });

  useEffect(() => {
    if (colors && !initialized.current) {
      form.reset({
        primaryColor: colors.primaryColor,
        secondaryColor: colors.secondaryColor,
        accentColor: colors.accentColor,
        backgroundColor: colors.backgroundColor,
        textColor: colors.textColor,
        headerBgColor: colors.headerBgColor,
        footerBgColor: colors.footerBgColor,
        buttonColor: colors.buttonColor,
        buttonTextColor: colors.buttonTextColor,
        linkColor: colors.linkColor,
      });
      initialized.current = true;
    }
  }, [colors, form]);

  const onSubmit = (data: ColorsFormValues) => {
    updateColors.mutate(
      { data },
      {
        onSuccess: (updatedData) => {
          queryClient.setQueryData(getGetColorsQueryKey(), updatedData);
          toast({
            title: "تم الحفظ بنجاح",
            description: "تم تحديث ألوان الموقع بنجاح.",
          });
        },
        onError: () => {
          toast({
            title: "خطأ في الحفظ",
            description: "حدث خطأ أثناء محاولة حفظ الألوان.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const ColorInput = ({ name, label }: { name: keyof ColorsFormValues, label: string }) => {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="flex gap-3 items-center">
                <div 
                  className="w-10 h-10 rounded-md border border-border shadow-sm flex-shrink-0 cursor-pointer overflow-hidden relative"
                  style={{ backgroundColor: field.value }}
                >
                  <input 
                    type="color" 
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input 
                  {...field} 
                  dir="ltr" 
                  className="text-left font-mono uppercase" 
                  placeholder="#000000"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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
        <h1 className="text-3xl font-bold tracking-tight">ألوان الموقع</h1>
        <p className="text-muted-foreground mt-2">
          تحكم في الهوية البصرية لموقعك وتغيير الألوان لجميع العناصر.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>الألوان الرئيسية</CardTitle>
              <CardDescription>
                الألوان التي تشكل الهوية البصرية الأساسية للموقع.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ColorInput name="primaryColor" label="اللون الأساسي (Primary)" />
              <ColorInput name="secondaryColor" label="اللون الثانوي (Secondary)" />
              <ColorInput name="accentColor" label="لون التمييز (Accent)" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ألوان الخلفية والنصوص</CardTitle>
              <CardDescription>
                ألوان خلفية الموقع والنصوص الرئيسية.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <ColorInput name="backgroundColor" label="لون خلفية الموقع" />
              <ColorInput name="textColor" label="لون النص الرئيسي" />
              <ColorInput name="headerBgColor" label="لون خلفية الترويسة (Header)" />
              <ColorInput name="footerBgColor" label="لون خلفية التذييل (Footer)" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الأزرار والروابط</CardTitle>
              <CardDescription>
                ألوان العناصر القابلة للنقر.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <ColorInput name="buttonColor" label="لون الأزرار" />
              <ColorInput name="buttonTextColor" label="لون نص الأزرار" />
              <ColorInput name="linkColor" label="لون الروابط" />
            </CardContent>
            <CardFooter className="bg-muted/50 py-4 border-t flex justify-end">
              <Button type="submit" disabled={updateColors.isPending}>
                {updateColors.isPending ? (
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
