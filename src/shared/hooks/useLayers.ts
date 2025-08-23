import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

type TWidget = {
  id: string;
  type: string;
  name?: string;
  visible?: boolean;
  locked?: boolean;
  props: Record<string, any>;
};

type TSection = {
  id: string;
  name?: string;
  visible?: boolean;
  locked?: boolean;
  collapsed?: boolean;
  direction: string;
  justify: string;
  align: string;
  gap: string;
  padding: string;
  margin?: string;
  widgets: TWidget[];
};

type TLayerActions = {
  toggleVisibility: (id: string, type: "section" | "widget") => Promise<void>;
  toggleLock: (id: string, type: "section" | "widget") => Promise<void>;
  rename: (id: string, name: string, type: "section" | "widget") => Promise<void>;
  toggleCollapse: (sectionId: string) => Promise<void>;
  reorderSections: (sections: TSection[]) => Promise<void>;
  reorderWidgets: (sectionId: string, widgets: TWidget[]) => Promise<void>;
  deleteItems: (ids: string[]) => Promise<void>;
};

export function useLayers(pageId: string): [TSection[], TLayerActions] {
  const pageContent = useQuery(api.site.getPageContent, { pageId });
  const updateLayerMeta = useMutation(api.site.updateLayerMeta);
  const reorderSectionsMutation = useMutation(api.site.reorderSections);
  const reorderWidgetsMutation = useMutation(api.site.reorderWidgets);
  const deleteItemsMutation = useMutation(api.site.deleteItems);
  
  const [optimisticSections, setOptimisticSections] = useState<TSection[]>([]);
  
  const sections = pageContent?.sections || optimisticSections;

  const toggleVisibility = useCallback(
    async (id: string, type: "section" | "widget") => {
      if (!sections.length) return;
      
      let currentVisible = true;
      
      if (type === "section") {
        const section = sections.find(s => s.id === id);
        currentVisible = section?.visible !== false;
      } else {
        const widget = sections.flatMap(s => s.widgets).find(w => w.id === id);
        currentVisible = widget?.visible !== false;
      }
      
      const newVisible = !currentVisible;
      
      setOptimisticSections(prev => {
        const updated = prev.map(section => {
          if (type === "section" && section.id === id) {
            return { ...section, visible: newVisible };
          }
          if (type === "widget") {
            const updatedWidgets = section.widgets.map(widget => {
              if (widget.id === id) {
                return { ...widget, visible: newVisible };
              }
              return widget;
            });
            return { ...section, widgets: updatedWidgets };
          }
          return section;
        });
        return updated;
      });

      try {
        await updateLayerMeta({
          pageId,
          layerId: id,
          layerType: type,
          data: { visible: newVisible },
        });
        toast.success(`Layer ${newVisible ? 'shown' : 'hidden'}`);
      } catch (error) {
        console.error("Failed to toggle visibility:", error);
        toast.error("Failed to toggle visibility");
        
        setOptimisticSections(prev => {
          const reverted = prev.map(section => {
            if (type === "section" && section.id === id) {
              return { ...section, visible: currentVisible };
            }
            if (type === "widget") {
              const revertedWidgets = section.widgets.map(widget => {
                if (widget.id === id) {
                  return { ...widget, visible: currentVisible };
                }
                return widget;
              });
              return { ...section, widgets: revertedWidgets };
            }
            return section;
          });
          return reverted;
        });
      }
    },
    [sections, updateLayerMeta, pageId]
  );

  const toggleLock = useCallback(
    async (id: string, type: "section" | "widget") => {
      if (!sections.length) return;
      
      let currentLocked = false;
      
      if (type === "section") {
        const section = sections.find(s => s.id === id);
        currentLocked = section?.locked === true;
      } else {
        const widget = sections.flatMap(s => s.widgets).find(w => w.id === id);
        currentLocked = widget?.locked === true;
      }
      
      const newLocked = !currentLocked;

      setOptimisticSections(prev => {
        const updated = prev.map(section => {
          if (type === "section" && section.id === id) {
            return { ...section, locked: newLocked };
          }
          if (type === "widget") {
            const updatedWidgets = section.widgets.map(widget => {
              if (widget.id === id) {
                return { ...widget, locked: newLocked };
              }
              return widget;
            });
            return { ...section, widgets: updatedWidgets };
          }
          return section;
        });
        return updated;
      });

      try {
        await updateLayerMeta({
          pageId,
          layerId: id,
          layerType: type,
          data: { locked: newLocked },
        });
        toast.success(`Layer ${newLocked ? 'locked' : 'unlocked'}`);
      } catch (error) {
        console.error("Failed to toggle lock:", error);
        toast.error("Failed to toggle lock");
        
        setOptimisticSections(prev => {
          const reverted = prev.map(section => {
            if (type === "section" && section.id === id) {
              return { ...section, locked: currentLocked };
            }
            if (type === "widget") {
              const revertedWidgets = section.widgets.map(widget => {
                if (widget.id === id) {
                  return { ...widget, locked: currentLocked };
                }
                return widget;
              });
              return { ...section, widgets: revertedWidgets };
            }
            return section;
          });
          return reverted;
        });
      }
    },
    [sections, updateLayerMeta, pageId]
  );

  const rename = useCallback(
    async (id: string, name: string, type: "section" | "widget") => {
      if (!sections.length) return;
      
      setOptimisticSections(prev => {
        const updated = prev.map(section => {
          if (type === "section" && section.id === id) {
            return { ...section, name };
          }
          if (type === "widget") {
            const updatedWidgets = section.widgets.map(widget => {
              if (widget.id === id) {
                return { ...widget, name };
              }
              return widget;
            });
            return { ...section, widgets: updatedWidgets };
          }
          return section;
        });
        return updated;
      });

      try {
        await updateLayerMeta({
          pageId,
          layerId: id,
          layerType: type,
          data: { name },
        });
        toast.success("Layer renamed");
      } catch (error) {
        console.error("Failed to rename layer:", error);
        toast.error("Failed to rename layer");
      }
    },
    [sections, updateLayerMeta, pageId]
  );

  const toggleCollapse = useCallback(
    async (sectionId: string) => {
      if (!sections.length) return;
      
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;
      
      const newCollapsed = !section.collapsed;

      setOptimisticSections(prev => {
        const updated = prev.map(s => {
          if (s.id === sectionId) {
            return { ...s, collapsed: newCollapsed };
          }
          return s;
        });
        return updated;
      });

      try {
        await updateLayerMeta({
          pageId,
          layerId: sectionId,
          layerType: "section",
          data: { collapsed: newCollapsed },
        });
      } catch (error) {
        console.error("Failed to toggle collapse:", error);
        toast.error("Failed to toggle collapse");
        
        setOptimisticSections(prev => {
          const reverted = prev.map(s => {
            if (s.id === sectionId) {
              return { ...s, collapsed: section.collapsed };
            }
            return s;
          });
          return reverted;
        });
      }
    },
    [sections, updateLayerMeta, pageId]
  );

  const reorderSections = useCallback(
    async (newSections: TSection[]) => {
      setOptimisticSections(newSections);

      try {
        const orderedIds = newSections.map(s => s.id);
        await reorderSectionsMutation({ pageId, orderedIds });
        toast.success("Sections reordered");
      } catch (error) {
        console.error("Failed to reorder sections:", error);
        toast.error("Failed to reorder sections");
        
        setOptimisticSections(sections);
      }
    },
    [reorderSectionsMutation, pageId, sections]
  );

  const reorderWidgets = useCallback(
    async (sectionId: string, newWidgets: TWidget[]) => {
      setOptimisticSections(prev => {
        const updated = prev.map(section => {
          if (section.id === sectionId) {
            return { ...section, widgets: newWidgets };
          }
          return section;
        });
        return updated;
      });

      try {
        const orderedIds = newWidgets.map(w => w.id);
        await reorderWidgetsMutation({ pageId, sectionId, orderedIds });
        toast.success("Widgets reordered");
      } catch (error) {
        console.error("Failed to reorder widgets:", error);
        toast.error("Failed to reorder widgets");
        
        setOptimisticSections(prev => {
          const reverted = prev.map(section => {
            if (section.id === sectionId) {
              const originalSection = sections.find(s => s.id === sectionId);
              return { ...section, widgets: originalSection?.widgets || [] };
            }
            return section;
          });
          return reverted;
        });
      }
    },
    [reorderWidgetsMutation, pageId, sections]
  );

  const deleteItems = useCallback(
    async (ids: string[]) => {
      if (!sections.length || !ids.length) return;
      
      // Optimistically update the state
      const idsToDelete = new Set(ids);
      const originalSections = [...sections];
      
      setOptimisticSections(prev => {
        const updated = prev
          .filter(section => !idsToDelete.has(section.id))
          .map(section => ({
            ...section,
            widgets: section.widgets.filter(widget => !idsToDelete.has(widget.id))
          }));
        return updated;
      });

      try {
        await deleteItemsMutation({ pageId, itemIds: ids });
        toast.success(`${ids.length === 1 ? 'Item' : 'Items'} deleted successfully`);
      } catch (error) {
        console.error("Failed to delete items:", error);
        toast.error("Failed to delete items");
        
        // Revert on error
        setOptimisticSections(originalSections);
      }
    },
    [sections, deleteItemsMutation, pageId]
  );

  return [
    sections,
    {
      toggleVisibility,
      toggleLock,
      rename,
      toggleCollapse,
      reorderSections,
      reorderWidgets,
      deleteItems,
    },
  ];
}
