import { useMemo, useState } from "react";
import {
  useGetSections,
  getGetSectionsQueryKey,
  useUpdateSection,
  useReorderSections,
  useCreateSection,
  useDeleteSection,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  GripVertical,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";

export function SectionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [isReordering, setIsReordering] = useState(false);

  const { data: sections, isLoading } = useGetSections({
    query: {
      queryKey: getGetSectionsQueryKey(),
      staleTime: 30_000, // 30 ثانية — يمنع إعادة الجلب التلقائي بعد كل عملية
    },
  });

  const updateSection = useUpdateSection();
  const reorderSections = useReorderSections();
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();

  // Sort once — basis for everything
  const sortedSections = useMemo(
    () =>
      sections
        ? [...sections].sort((a, b) => a.sortOrder - b.sortOrder)
        : [],
    [sections]
  );

  const doReorder = async (newOrder: typeof sortedSections) => {
    if (isReordering) return;
    setIsReordering(true);
    const orderedIds = newOrder.map((s) => s.id);

    try {
      const result = await reorderSections.mutateAsync({
        data: { orderedIds },
      });
      // مباشرة نضع نتيجة الـ server في الـ cache
      queryClient.setQueryData(
        getGetSectionsQueryKey(),
        result
      );
    } catch {
      // عند الخطأ: نجلب البيانات من جديد
      await queryClient.invalidateQueries({
        queryKey: getGetSectionsQueryKey(),
      });
      toast({
        title: "خطأ",
        description: "تعذّر تغيير الترتيب.",
        variant: "destructive",
      });
    } finally {
      setIsReordering(false);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0 || isReordering) return;
    const next = [...sortedSections];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    // ضع الترتيب الجديد في الـ cache فوراً (قبل انتهاء الطلب)
    queryClient.setQueryData(
      getGetSectionsQueryKey(),
      next.map((s, i) => ({ ...s, sortOrder: i }))
    );
    doReorder(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedSections.length - 1 || isReordering) return;
    const next = [...sortedSections];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    // ضع الترتيب الجديد في الـ cache فوراً
    queryClient.setQueryData(
      getGetSectionsQueryKey(),
      next.map((s, i) => ({ ...s, sortOrder: i }))
    );
    doReorder(next);
  };

  const handleToggleVisibility = (id: number, currentVisibility: boolean) => {
    updateSection.mutate(
      { id, data: { isVisible: !currentVisibility } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetSectionsQueryKey(),
          });
          toast({
            title: "تم التحديث",
            description: "تم تغيير حالة ظهور القسم.",
          });
        },
      }
    );
  };

  const handleCreateSection = () => {
    if (!newSectionName || !newSectionLabel) return;
    createSection.mutate(
      {
        data: {
          name: newSectionName,
          label: newSectionLabel,
          isVisible: true,
          sortOrder: sortedSections.length,
        },
      },
      {
        onSuccess: () => {
          setNewSectionName("");
          setNewSectionLabel("");
          queryClient.invalidateQueries({
            queryKey: getGetSectionsQueryKey(),
          });
          toast({
            title: "تمت الإضافة",
            description: "تمت إضافة القسم الجديد بنجاح.",
          });
        },
      }
    );
  };

  const handleDeleteSection = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    deleteSection.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetSectionsQueryKey(),
          });
          toast({
            title: "تم الحذف",
            description: "تم حذف القسم بنجاح.",
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
        <h1 className="text-3xl font-bold tracking-tight">إدارة الأقسام</h1>
        <p className="text-muted-foreground mt-2">
          تحكم في ترتيب وظهور أقسام الموقع المختلفة.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إضافة قسم جديد</CardTitle>
          <CardDescription>
            إضافة قسم جديد لترتيبه وعرضه في الموقع.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="grid gap-2 flex-1">
            <label className="text-sm font-medium">
              معرف القسم (بالانجليزية)
            </label>
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="about, services, contact..."
              dir="ltr"
            />
          </div>
          <div className="grid gap-2 flex-1">
            <label className="text-sm font-medium">اسم القسم (للعرض)</label>
            <Input
              value={newSectionLabel}
              onChange={(e) => setNewSectionLabel(e.target.value)}
              placeholder="من نحن، الخدمات..."
            />
          </div>
          <Button
            onClick={handleCreateSection}
            disabled={
              !newSectionName || !newSectionLabel || createSection.isPending
            }
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ترتيب الأقسام</CardTitle>
          <CardDescription>
            استخدم الأسهم لتغيير ترتيب الأقسام، أو فعّل/عطّل ظهورها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isReordering && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري حفظ الترتيب...
            </div>
          )}
          <div className="space-y-2">
            {sortedSections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-4 border rounded-md bg-card shadow-sm hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5 text-center select-none">
                    {index + 1}
                  </span>

                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isReordering}
                      title="تحريك لأعلى"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveDown(index)}
                      disabled={
                        index === sortedSections.length - 1 || isReordering
                      }
                      title="تحريك لأسفل"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <GripVertical className="text-muted-foreground w-5 h-5 opacity-40" />

                  <div>
                    <p className="font-medium">{section.label}</p>
                    <p
                      className="text-xs text-muted-foreground font-mono"
                      dir="ltr"
                    >
                      {section.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    {section.isVisible ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={section.isVisible}
                      onCheckedChange={() =>
                        handleToggleVisibility(section.id, section.isVisible)
                      }
                      disabled={updateSection.isPending}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteSection(section.id)}
                    disabled={deleteSection.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {sortedSections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد أقسام حالياً.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
