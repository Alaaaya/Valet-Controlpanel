import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, FileText } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface WpPage {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  status: string;
  link: string;
  modified: string;
  slug: string;
}

const pageSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  content: z.string(),
  status: z.enum(["publish", "draft", "private"]),
  slug: z.string().optional(),
});

type PageFormValues = z.infer<typeof pageSchema>;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function WpPagesPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<WpPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<WpPage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: { title: "", content: "", status: "publish", slug: "" },
  });

  async function loadPages() {
    try {
      const res = await fetch(`${BASE}/api/wp/pages`);
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "خطأ", description: "تعذّر تحميل الصفحات", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadPages(); }, []);

  function openCreate() {
    setEditingPage(null);
    setIsCreating(true);
    form.reset({ title: "", content: "", status: "publish", slug: "" });
    setDialogOpen(true);
  }

  function openEdit(page: WpPage) {
    setEditingPage(page);
    setIsCreating(false);
    form.reset({
      title: page.title.rendered,
      content: stripHtml(page.content.rendered),
      status: page.status as "publish" | "draft" | "private",
      slug: page.slug,
    });
    setDialogOpen(true);
  }

  const onSubmit = async (values: PageFormValues) => {
    setIsSaving(true);
    try {
      const body = {
        title: values.title,
        content: values.content,
        status: values.status,
        ...(values.slug ? { slug: values.slug } : {}),
      };

      const url = isCreating
        ? `${BASE}/api/wp/pages`
        : `${BASE}/api/wp/pages/${editingPage?.id}`;

      const res = await fetch(url, {
        method: isCreating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      toast({ title: isCreating ? "تم الإنشاء" : "تم التحديث", description: isCreating ? "تم إنشاء الصفحة بنجاح في WordPress." : "تم تحديث الصفحة بنجاح في WordPress." });
      setDialogOpen(false);
      await loadPages();
    } catch {
      toast({ title: "خطأ", description: "تعذّر حفظ الصفحة.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (page: WpPage) => {
    setDeletingId(page.id);
    try {
      const res = await fetch(`${BASE}/api/wp/pages/${page.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "تم الحذف", description: `تم حذف صفحة "${page.title.rendered}" من WordPress.` });
      await loadPages();
    } catch {
      toast({ title: "خطأ", description: "تعذّر حذف الصفحة.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const statusLabel = (s: string) => {
    if (s === "publish") return { label: "منشورة", color: "default" as const };
    if (s === "draft") return { label: "مسودة", color: "secondary" as const };
    return { label: "خاصة", color: "outline" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">صفحات WordPress</h1>
          <p className="text-muted-foreground mt-2">إدارة صفحات موقعك مباشرة على WordPress.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-page">
          <Plus className="h-4 w-4 ml-2" />
          صفحة جديدة
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">لا توجد صفحات</h3>
            <p className="text-muted-foreground mt-1">أنشئ أول صفحة في موقعك.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pages.map(page => {
            const s = statusLabel(page.status);
            return (
              <Card key={page.id} data-testid={`card-page-${page.id}`}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{page.title.rendered}</p>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                    <Badge variant={s.color}>{s.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={page.link} target="_blank" rel="noopener noreferrer" data-testid={`link-view-page-${page.id}`}>
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(page)} data-testid={`button-edit-page-${page.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingId === page.id}
                      onClick={() => handleDelete(page)}
                      data-testid={`button-delete-page-${page.id}`}
                    >
                      {deletingId === page.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{isCreating ? "إنشاء صفحة جديدة" : "تعديل الصفحة"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "أنشئ صفحة جديدة في موقع WordPress." : `تعديل صفحة "${editingPage?.title.rendered}"`}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الصفحة</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" data-testid="input-page-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرابط (Slug)</FormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" placeholder="about-us" data-testid="input-page-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-page-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="publish">منشورة</SelectItem>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="private">خاصة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محتوى الصفحة</FormLabel>
                    <FormControl>
                      <Textarea {...field} dir="auto" rows={8} data-testid="input-page-content" placeholder="أدخل محتوى الصفحة هنا..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={isSaving} data-testid="button-save-page">
                  {isSaving ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري الحفظ...</> : <><Save className="h-4 w-4 ml-2" />{isCreating ? "إنشاء" : "حفظ"}</>}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Save(props: React.ComponentProps<typeof Loader2>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>;
}
