import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, FileText, Save } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface WpPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  status: string;
  link: string;
  modified: string;
  slug: string;
}

const postSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  content: z.string(),
  excerpt: z.string().optional(),
  status: z.enum(["publish", "draft", "private"]),
  slug: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

const statusLabel = (s: string) => {
  if (s === "publish") return { label: "منشور", color: "default" as const };
  if (s === "draft") return { label: "مسودة", color: "secondary" as const };
  return { label: "خاص", color: "outline" as const };
};

export function WpPostsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<WpPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", excerpt: "", status: "publish", slug: "" },
  });

  async function loadPosts() {
    try {
      const res = await fetch(`${BASE}/api/wp/posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "خطأ", description: "تعذّر تحميل المنشورات", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  function openCreate() {
    setEditingPost(null);
    setIsCreating(true);
    form.reset({ title: "", content: "", excerpt: "", status: "publish", slug: "" });
    setDialogOpen(true);
  }

  function openEdit(post: WpPost) {
    setEditingPost(post);
    setIsCreating(false);
    form.reset({
      title: post.title.rendered,
      content: stripHtml(post.content.rendered),
      excerpt: stripHtml(post.excerpt.rendered),
      status: post.status as "publish" | "draft" | "private",
      slug: post.slug,
    });
    setDialogOpen(true);
  }

  const onSubmit = async (values: PostFormValues) => {
    setIsSaving(true);
    try {
      const body = {
        title: values.title,
        content: values.content,
        excerpt: values.excerpt || "",
        status: values.status,
        ...(values.slug ? { slug: values.slug } : {}),
      };

      const url = isCreating
        ? `${BASE}/api/wp/posts`
        : `${BASE}/api/wp/posts/${editingPost?.id}`;

      const res = await fetch(url, {
        method: isCreating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      toast({ title: isCreating ? "تم النشر" : "تم التحديث", description: isCreating ? "تم نشر المنشور في WordPress." : "تم تحديث المنشور في WordPress." });
      setDialogOpen(false);
      await loadPosts();
    } catch {
      toast({ title: "خطأ", description: "تعذّر حفظ المنشور.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (post: WpPost) => {
    setDeletingId(post.id);
    try {
      const res = await fetch(`${BASE}/api/wp/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "تم الحذف", description: `تم حذف "${post.title.rendered}" من WordPress.` });
      await loadPosts();
    } catch {
      toast({ title: "خطأ", description: "تعذّر حذف المنشور.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مدونة WordPress</h1>
          <p className="text-muted-foreground mt-2">إدارة منشورات المدونة مباشرة على WordPress.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-post">
          <Plus className="h-4 w-4 ml-2" />
          منشور جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">لا توجد منشورات</h3>
            <p className="text-muted-foreground mt-1">أنشئ أول منشور في مدونتك.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const s = statusLabel(post.status);
            return (
              <Card key={post.id} data-testid={`card-post-${post.id}`}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{post.title.rendered}</p>
                      <p className="text-sm text-muted-foreground">/{post.slug}</p>
                    </div>
                    <Badge variant={s.color}>{s.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={post.link} target="_blank" rel="noopener noreferrer" data-testid={`link-view-post-${post.id}`}>
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)} data-testid={`button-edit-post-${post.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingId === post.id}
                      onClick={() => handleDelete(post)}
                      data-testid={`button-delete-post-${post.id}`}
                    >
                      {deletingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
            <DialogTitle>{isCreating ? "إنشاء منشور جديد" : "تعديل المنشور"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "انشر محتوى جديد على مدونة WordPress." : `تعديل "${editingPost?.title.rendered}"`}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان المنشور</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" data-testid="input-post-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرابط (Slug)</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" placeholder="my-post" data-testid="input-post-slug" />
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
                          <SelectTrigger data-testid="select-post-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="publish">منشور</SelectItem>
                          <SelectItem value="draft">مسودة</SelectItem>
                          <SelectItem value="private">خاص</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المقتطف (اختياري)</FormLabel>
                    <FormControl>
                      <Input {...field} dir="auto" data-testid="input-post-excerpt" placeholder="وصف مختصر للمنشور..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محتوى المنشور</FormLabel>
                    <FormControl>
                      <Textarea {...field} dir="auto" rows={8} data-testid="input-post-content" placeholder="أدخل محتوى المنشور هنا..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={isSaving} data-testid="button-save-post">
                  {isSaving ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري الحفظ...</> : <><Save className="h-4 w-4 ml-2" />{isCreating ? "نشر" : "حفظ"}</>}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
