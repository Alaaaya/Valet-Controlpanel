import { useState } from "react";
import { useGetSections, getGetSectionsQueryKey, useUpdateSection, useReorderSections, useCreateSection, useDeleteSection } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

export function SectionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionLabel, setNewSectionLabel] = useState("");

  const { data: sections, isLoading } = useGetSections({ 
    query: { queryKey: getGetSectionsQueryKey() } 
  });

  const updateSection = useUpdateSection();
  const reorderSections = useReorderSections();
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();

  const handleToggleVisibility = (id: number, currentVisibility: boolean) => {
    updateSection.mutate(
      { id, data: { isVisible: !currentVisibility } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() });
          toast({
            title: "تم التحديث",
            description: "تم تغيير حالة ظهور القسم.",
          });
        }
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
          sortOrder: sections ? sections.length : 0
        } 
      },
      {
        onSuccess: () => {
          setNewSectionName("");
          setNewSectionLabel("");
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() });
          toast({
            title: "تمت الإضافة",
            description: "تمت إضافة القسم الجديد بنجاح.",
          });
        }
      }
    );
  };

  const handleDeleteSection = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    
    deleteSection.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() });
          toast({
            title: "تم الحذف",
            description: "تم حذف القسم بنجاح.",
          });
        }
      }
    );
  };

  const handleMoveUp = (index: number) => {
    if (!sections || index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    
    const orderedIds = newSections.map(s => s.id);
    
    reorderSections.mutate(
      { data: { orderedIds } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetSectionsQueryKey(), data);
        }
      }
    );
  };

  const handleMoveDown = (index: number) => {
    if (!sections || index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    
    const orderedIds = newSections.map(s => s.id);
    
    reorderSections.mutate(
      { data: { orderedIds } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetSectionsQueryKey(), data);
        }
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

  // Sort sections by sortOrder
  const sortedSections = sections ? [...sections].sort((a, b) => a.sortOrder - b.sortOrder) : [];

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
          <CardDescription>إضافة قسم جديد لترتيبه وعرضه في الموقع.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="grid gap-2 flex-1">
            <label className="text-sm font-medium">معرف القسم (بالانجليزية، مثل: hero)</label>
            <Input 
              value={newSectionName} 
              onChange={(e) => setNewSectionName(e.target.value)} 
              placeholder="about, services, contact..."
              dir="ltr"
            />
          </div>
          <div className="grid gap-2 flex-1">
            <label className="text-sm font-medium">اسم القسم (للعرض في القائمة)</label>
            <Input 
              value={newSectionLabel} 
              onChange={(e) => setNewSectionLabel(e.target.value)} 
              placeholder="من نحن، الخدمات..."
            />
          </div>
          <Button 
            onClick={handleCreateSection} 
            disabled={!newSectionName || !newSectionLabel || createSection.isPending}
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
            يمكنك تغيير ترتيب الأقسام وتفعيل/تعطيل ظهورها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedSections.map((section, index) => (
              <div 
                key={section.id} 
                className="flex items-center justify-between p-4 border rounded-md bg-card shadow-sm hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveUp(index)} disabled={index === 0 || reorderSections.isPending}>
                      ▲
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveDown(index)} disabled={index === sortedSections.length - 1 || reorderSections.isPending}>
                      ▼
                    </Button>
                  </div>
                  <GripVertical className="text-muted-foreground w-5 h-5 cursor-move opacity-50" />
                  <div>
                    <p className="font-medium">{section.label}</p>
                    <p className="text-xs text-muted-foreground font-mono" dir="ltr">{section.name}</p>
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
                      onCheckedChange={() => handleToggleVisibility(section.id, section.isVisible)}
                      disabled={updateSection.isPending}
                    />
                  </div>
                  
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSection(section.id)} disabled={deleteSection.isPending}>
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
