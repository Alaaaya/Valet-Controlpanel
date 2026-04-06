import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2 } from "lucide-react";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const schema = z.object({
  primaryColor: z.string().regex(hexColorRegex),
  secondaryColor: z.string().regex(hexColorRegex),
  accentColor: z.string().regex(hexColorRegex),
  backgroundColor: z.string().regex(hexColorRegex),
  textColor: z.string().regex(hexColorRegex),
  headerBgColor: z.string().regex(hexColorRegex),
  footerBgColor: z.string().regex(hexColorRegex),
  buttonColor: z.string().regex(hexColorRegex),
  buttonTextColor: z.string().regex(hexColorRegex),
  linkColor: z.string().regex(hexColorRegex),
});

export function ColorsPage() {
  const initialized = useRef(false);

  const form = useForm({
    resolver: zodResolver(schema),
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // تحميل
  useEffect(() => {
    fetch("/api/colors")
      .then(res => res.json())
      .then(data => {
        form.reset(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // حفظ
  const onSubmit = (data: any) => {
    setSaving(true);

    fetch("/api/colors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(() => alert("تم الحفظ"))
      .catch(() => alert("خطأ"))
      .finally(() => setSaving(false));
  };

  const ColorInput = ({ name, label }: any) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
              <Input {...field} />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ألوان الموقع</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>الألوان</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">

              <ColorInput name="primaryColor" label="Primary" />
              <ColorInput name="secondaryColor" label="Secondary" />
              <ColorInput name="accentColor" label="Accent" />
              <ColorInput name="backgroundColor" label="Background" />
              <ColorInput name="textColor" label="Text" />
              <ColorInput name="headerBgColor" label="Header" />
              <ColorInput name="footerBgColor" label="Footer" />
              <ColorInput name="buttonColor" label="Button" />
              <ColorInput name="buttonTextColor" label="Button Text" />
              <ColorInput name="linkColor" label="Link" />

            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
              </Button>
            </CardFooter>
          </Card>

        </form>
      </Form>
    </div>
  );
}