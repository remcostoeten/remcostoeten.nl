import { useState, useCallback, useMemo, useReducer, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { selectionReducer, TSelectionAction } from "@/shared/reducers/selection-reducer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Type,
  Box,
  Link2,
  Code,
  Layers,
  GripVertical,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";

type TWidget = {
  id: string;
  type: string;
  name?: string;
  visible?: boolean;
  locked?: boolean;
  props: Record<string, any>;
}

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
}

type TProps = {
  sections: TSection[];
  selectedId?: string | null;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
  onSelectItems?: (ids: string[]) => void;
  onToggleVisibility: (id: string, type: "section" | "widget") => void;
  onToggleLock: (id: string, type: "section" | "widget") => void;
  onHideItems?: (ids: string[]) => void;
  onDeleteItems?: (ids: string[]) => void;
  onDeleteItem?: (id: string, type: "section" | "widget") => void;
  onReorderSections: (sections: TSection[]) => void;
  onReorderWidgets: (sectionId: string, widgets: TWidget[]) => void;
  onRenameItem: (id: string, name: string, type: "section" | "widget") => void;
  onToggleCollapse: (sectionId: string) => void;
}

const WIDGET_ICONS = {
  text: Type,
  heading: Type,
  project: Box,
  link: Link2,
  dynamic: Code,
} as const;

function LayerItem({
  item,
  type,
  depth = 0,
  isSelected,
  isMultiSelected,
  isDragging,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDelete,
  widgetCount,
}: {
  item: TSection | TWidget;
  type: "section" | "widget";
  depth?: number;
  isSelected: boolean;
  isMultiSelected?: boolean;
  isDragging?: boolean;
  onSelect: (event?: React.MouseEvent) => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  widgetCount?: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  
  const Icon = type === "section" ? Layers : WIDGET_ICONS[(item as TWidget).type as keyof typeof WIDGET_ICONS] || Box;
  const displayName = item.name || (type === "section" ? `Section ${item.id.slice(-4)}` : `${(item as TWidget).type} Widget`);
  
  function handleStartEdit() {
    setEditValue(displayName);
    setIsEditing(true);
  }
  
  function handleFinishEdit() {
    if (editValue.trim()) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  }
  
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFinishEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  }
  
  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    onSelect(event);
  }
  
  return (
    <div
      className={`
        group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all cursor-pointer
        ${isSelected ? "bg-zinc-800/50 ring-1 ring-zinc-700" : "hover:bg-zinc-800/30"}
        ${isDragging ? "opacity-50" : ""}
        ${!item.visible ? "opacity-40" : ""}
      `}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={handleClick}
    >
      <GripVertical className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
      
      <div className="w-4 h-4 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-zinc-400" />
      </div>
      
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleFinishEdit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 px-1 py-0.5 bg-zinc-900/50 border border-zinc-700 rounded text-xs text-white outline-none focus:border-zinc-600"
          autoFocus
        />
      ) : (
        <span
          className="flex-1 text-xs text-zinc-300 truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleStartEdit();
          }}
        >
          {displayName}
        </span>
      )}
      
      {type === "section" && widgetCount !== undefined && widgetCount > 0 && (
        <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs text-zinc-500">
          {widgetCount}
        </span>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 rounded hover:bg-red-600/30 transition-colors opacity-0 group-hover:opacity-100"
        disabled={item.locked}
        title={`Delete ${type}`}
      >
        <Trash2 className="w-3 h-3 text-red-400" />
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock();
        }}
        className="p-1 rounded hover:bg-zinc-700/50 transition-colors opacity-0 group-hover:opacity-100"
      >
        {item.locked ? (
          <Lock className="w-3 h-3 text-zinc-500" />
        ) : (
          <Unlock className="w-3 h-3 text-zinc-600" />
        )}
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="p-1 rounded hover:bg-zinc-700/50 transition-colors"
      >
        {item.visible !== false ? (
          <Eye className="w-3 h-3 text-zinc-400" />
        ) : (
          <EyeOff className="w-3 h-3 text-zinc-600" />
        )}
      </button>
    </div>
  );
}

function SortableLayerItem({
  item,
  type,
  depth,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDelete,
  widgetCount,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: item.locked });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LayerItem
        item={item}
        type={type}
        depth={depth}
        isSelected={isSelected}
        isDragging={isDragging}
        onSelect={onSelect}
        onToggleVisibility={onToggleVisibility}
        onToggleLock={onToggleLock}
        onRename={onRename}
        onDelete={onDelete}
        widgetCount={widgetCount}
      />
    </div>
  );
}

function SectionLayer({
  section,
  isSelected,
  selectedWidgetIds,
  onSelectSection,
  onSelectWidget,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onToggleCollapse,
  onReorderWidgets,
  onDeleteSection,
  onDeleteWidget,
}: {
  section: TSection;
  isSelected: boolean;
  selectedWidgetIds: string[];
  onSelectSection: (event?: React.MouseEvent) => void;
  onSelectWidget: (widgetId: string, event?: React.MouseEvent) => void;
  onToggleVisibility: (type: "section" | "widget", id?: string) => void;
  onToggleLock: (type: "section" | "widget", id?: string) => void;
  onRename: (name: string, type: "section" | "widget", id?: string) => void;
  onToggleCollapse: () => void;
  onReorderWidgets: (widgets: TWidget[]) => void;
  onDeleteSection: () => void;
  onDeleteWidget: (widgetId: string) => void;
}) {
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const isCollapsed = section.collapsed ?? false;
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  function handleDragStart(event: DragStartEvent) {
    setActiveWidgetId(event.active.id as string);
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = section.widgets.findIndex((w) => w.id === active.id);
      const newIndex = section.widgets.findIndex((w) => w.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newWidgets = [...section.widgets];
        const [movedWidget] = newWidgets.splice(oldIndex, 1);
        newWidgets.splice(newIndex, 0, movedWidget);
        onReorderWidgets(newWidgets);
      }
    }
    
    setActiveWidgetId(null);
  }
  
  return (
    <div className="mb-1">
      <div
        className={`
          group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all cursor-pointer
          ${isSelected ? "bg-zinc-800/50 ring-1 ring-zinc-700" : "hover:bg-zinc-800/30"}
          ${!section.visible ? "opacity-40" : ""}
        `}
        onClick={onSelectSection}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="p-0.5 rounded hover:bg-zinc-700/50 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          ) : (
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          )}
        </button>
        
        <SortableLayerItem
          item={section}
          type="section"
          depth={0}
          isSelected={isSelected}
          onSelect={onSelectSection}
          onToggleVisibility={() => onToggleVisibility("section")}
          onToggleLock={() => onToggleLock("section")}
          onRename={(name) => onRename(name, "section")}
          onDelete={onDeleteSection}
          widgetCount={section.widgets.length}
        />
      </div>
      
      <AnimatePresence>
        {!isCollapsed && section.widgets.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={section.widgets.map(w => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="ml-4 mt-1 space-y-0.5">
                  {section.widgets.map((widget) => (
                    <SortableLayerItem
                      key={widget.id}
                      item={widget}
                      type="widget"
                      depth={1}
                      isSelected={selectedWidgetIds.includes(widget.id)}
                      onSelect={(event) => onSelectWidget(widget.id, event)}
                      onToggleVisibility={() => onToggleVisibility("widget", widget.id)}
                      onToggleLock={() => onToggleLock("widget", widget.id)}
                      onRename={(name) => onRename(name, "widget", widget.id)}
                      onDelete={() => onDeleteWidget(widget.id)}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeWidgetId ? (
                  <LayerItem
                    item={section.widgets.find(w => w.id === activeWidgetId)!}
                    type="widget"
                    depth={1}
                    isSelected={false}
                    isDragging
                    onSelect={() => {}}
                    onToggleVisibility={() => {}}
                    onToggleLock={() => {}}
                    onRename={() => {}}
                    onDelete={() => {}}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LayersPanel({
  sections,
  selectedId,
  selectedIds,
  onSelectItem,
  onSelectItems,
  onToggleVisibility,
  onToggleLock,
  onHideItems,
  onDeleteItems,
  onDeleteItem,
  onReorderSections,
  onReorderWidgets,
  onRenameItem,
  onToggleCollapse,
}: TProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [localSections, setLocalSections] = useState(sections);
  const [selectedIdsState, dispatch] = useReducer(selectionReducer, selectedIds || (selectedId ? [selectedId] : []));
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const currentSelectedIds = selectedIds || selectedIdsState;
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Generate flat ordered list of all IDs for range selection
  const orderedIds = useMemo(() => {
    const ids: string[] = [];
    localSections.forEach(section => {
      ids.push(section.id);
      section.widgets.forEach(widget => {
        ids.push(widget.id);
      });
    });
    return ids;
  }, [localSections]);
  
  // Sync local sections with props
  useMemo(() => {
    setLocalSections(sections);
  }, [sections]);
  
  // Handle outside click to clear selection
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        dispatch({ type: 'clear' });
      }
    }
    
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);
  
  // Notify parent of selection changes
  useEffect(() => {
    if (!selectedIds) {
      onSelectItems?.(currentSelectedIds);
      // Backward compatibility: call single selection callback if only one item selected
      if (currentSelectedIds.length === 1 && onSelectItem) {
        onSelectItem(currentSelectedIds[0]);
      }
    }
  }, [currentSelectedIds, onSelectItems, onSelectItem, selectedIds]);
  
  function handleItemSelect(id: string, event?: React.MouseEvent) {
    if (selectedIds) {
      // External control mode - just notify parent
      if (event?.shiftKey && lastSelectedId && orderedIds.length > 0) {
        const anchorIndex = orderedIds.indexOf(lastSelectedId);
        const targetIndex = orderedIds.indexOf(id);
        if (anchorIndex !== -1 && targetIndex !== -1) {
          const start = Math.min(anchorIndex, targetIndex);
          const end = Math.max(anchorIndex, targetIndex);
          const rangeIds = orderedIds.slice(start, end + 1);
          const newSelection = new Set(currentSelectedIds);
          rangeIds.forEach(rangeId => newSelection.add(rangeId));
          onSelectItems?.(Array.from(newSelection));
        }
      } else if (event?.ctrlKey || event?.metaKey || event?.altKey) {
        const newSelection = currentSelectedIds.includes(id)
          ? currentSelectedIds.filter(selectedId => selectedId !== id)
          : [...currentSelectedIds, id];
        onSelectItems?.(newSelection);
      } else {
        onSelectItems?.([id]);
      }
    } else {
      // Internal state mode
      if (event?.shiftKey && lastSelectedId) {
        dispatch({ type: 'range', anchorId: lastSelectedId, id, orderedIds });
      } else if (event?.ctrlKey || event?.metaKey || event?.altKey) {
        dispatch({ type: 'toggle', id });
      } else {
        dispatch({ type: 'single', id });
      }
    }
    setLastSelectedId(id);
  }
  
  function handleDragStart(event: DragStartEvent) {
    setActiveSectionId(event.active.id as string);
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = localSections.findIndex((s) => s.id === active.id);
      const newIndex = localSections.findIndex((s) => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = [...localSections];
        const [movedSection] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, movedSection);
        setLocalSections(newSections);
        onReorderSections(newSections);
      }
    }
    
    setActiveSectionId(null);
  }
  
  function handleHideSelected() {
    if (currentSelectedIds.length > 0) {
      onHideItems?.(currentSelectedIds);
      if (!selectedIds) {
        dispatch({ type: 'clear' });
      }
    }
  }
  
  function handleDeleteSelected() {
    if (currentSelectedIds.length > 0) {
      onDeleteItems?.(currentSelectedIds);
      if (!selectedIds) {
        dispatch({ type: 'clear' });
      }
    }
  }
  
  // Calculate selection states
  const selectedSectionIds = currentSelectedIds.filter(id => 
    localSections.some(s => s.id === id)
  );
  const selectedWidgetIds = currentSelectedIds.filter(id => 
    localSections.some(s => s.widgets.some(w => w.id === id))
  );
  
  return (
    <div ref={panelRef} className="w-80 h-full bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            Layers
          </h2>
          {currentSelectedIds.length > 1 && (
            <div className="flex gap-1">
              {onHideItems && (
                <button
                  onClick={handleHideSelected}
                  className="p-1 rounded hover:bg-zinc-700/50 transition-colors text-zinc-400 hover:text-zinc-300"
                  title={`Hide ${currentSelectedIds.length} items`}
                >
                  <EyeOff className="w-3 h-3" />
                </button>
              )}
              {onDeleteItems && (
                <button
                  onClick={handleDeleteSelected}
                  className="p-1 rounded hover:bg-zinc-700/50 transition-colors text-red-400 hover:text-red-300"
                  title={`Delete ${currentSelectedIds.length} items`}
                >
                  <Box className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
        {currentSelectedIds.length > 1 && (
          <p className="text-xs text-zinc-500 mt-1">
            {currentSelectedIds.length} items selected
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localSections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {localSections.map((section) => (
              <SectionLayer
                key={section.id}
                section={section}
                isSelected={currentSelectedIds.includes(section.id)}
                selectedWidgetIds={selectedWidgetIds}
                onSelectSection={(event) => handleItemSelect(section.id, event)}
                onSelectWidget={(widgetId, event) => handleItemSelect(widgetId, event)}
                onToggleVisibility={(type, widgetId) => {
                  if (type === "section") {
                    onToggleVisibility(section.id, "section");
                  } else if (widgetId) {
                    onToggleVisibility(widgetId, "widget");
                  }
                }}
                onToggleLock={(type, widgetId) => {
                  if (type === "section") {
                    onToggleLock(section.id, "section");
                  } else if (widgetId) {
                    onToggleLock(widgetId, "widget");
                  }
                }}
                onRename={(name, type, widgetId) => {
                  if (type === "section") {
                    onRenameItem(section.id, name, "section");
                  } else if (widgetId) {
                    onRenameItem(widgetId, name, "widget");
                  }
                }}
                onToggleCollapse={() => onToggleCollapse(section.id)}
                onReorderWidgets={(widgets) => onReorderWidgets(section.id, widgets)}
                onDeleteSection={() => onDeleteItem?.(section.id, "section")}
                onDeleteWidget={(widgetId) => onDeleteItem?.(widgetId, "widget")}
              />
            ))}
          </SortableContext>
          
          <DragOverlay>
            {activeSectionId ? (
              <LayerItem
                item={localSections.find(s => s.id === activeSectionId)!}
                type="section"
                depth={0}
                isSelected={false}
                isDragging
                onSelect={() => {}}
                onToggleVisibility={() => {}}
                onToggleLock={() => {}}
                onRename={() => {}}
                onDelete={() => {}}
                widgetCount={localSections.find(s => s.id === activeSectionId)?.widgets.length}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
        
        {localSections.length === 0 && (
          <div className="text-center py-8">
            <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-600">No layers yet</p>
            <p className="text-xs text-zinc-700 mt-1">Add sections to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
}
