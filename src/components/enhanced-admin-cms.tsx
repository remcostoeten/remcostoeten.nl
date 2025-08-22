import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { RichTextEditor } from "./rich-text-editor";
import { Widget } from "./widget";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Trash2, Eye, EyeOff, Upload, Download, ChevronDown, ChevronRight } from "lucide-react";
import { Textarea } from "./ui";


type TSeoConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  twitterCard: string;
}

type TSiteConfig {
  title: string;
  favicon: string;
  metaDescription: string;
  metaKeywords: string;
  bodyBgColor: string;
  bodyFontSize: string;
  bodyFont: string;
  seo: TSeoConfig;
}

type TWidget {
  id: string;
  type: string;
  props: Record<string, any>;
}

type TSection {
  id: string;
  direction: string;
  justify: string;
  align: string;
  gap: string;
  padding: string;
  margin?: string;
  widgets: TWidget[];
}

type TPageContent = {
  pageId: string;
  sections: TSection[];
}


const WIDGET_TYPES = {
  text: {
    label: "Text",
    color: "bg-blue-600",
    defaultProps: {
      text: "Start typing your content here...",
      fontSize: "text-base",
      fontWeight: "font-normal",
      color: "text-[hsl(var(--foreground))]",
      textAlign: "text-left",
    }
  },
  heading: {
    label: "Heading", 
    color: "bg-purple-600",
    defaultProps: {
      text: "Your Heading Here",
      level: 1,
      fontSize: "text-2xl",
      fontWeight: "font-bold",
      color: "text-[hsl(var(--foreground))]",
      textAlign: "text-left",
    }
  },
  project: {
    label: "Project",
    color: "bg-green-600", 
    defaultProps: {
      text: "Project Name",
      url: "https:
      fontSize: "text-base",
      githubOwner: "",
      githubRepo: "",
    }
  },
  link: {
    label: "Link",
    color: "bg-orange-600",
    defaultProps: {
      text: "Link Text",
      url: "https:
      fontSize: "text-base",
      fontWeight: "font-normal",
    }
  },
  dynamic: {
    label: "Dynamic",
    color: "bg-pink-600",
    defaultProps: {
      type: "current-time",
    }
  }
} as const;

const FONT_OPTIONS = [
  { value: "font-sans", label: "Sans Serif" },
  { value: "font-serif", label: "Serif" },
  { value: "font-mono", label: "Monospace" },
];

const FONT_SIZE_OPTIONS = [
  { value: "text-sm", label: "Small" },
  { value: "text-base", label: "Base" },
  { value: "text-lg", label: "Large" },
  { value: "text-xl", label: "Extra Large" },
];

const BG_COLOR_OPTIONS = [
  { value: "bg-white", label: "White", preview: "#ffffff" },
  { value: "bg-gray-50", label: "Light Gray", preview: "#f9fafb" },
  { value: "bg-gray-900", label: "Dark Gray", preview: "#111827" },
  { value: "bg-[hsl(0_0%_7%)]", label: "Very Dark", preview: "#1a1a1a" },
  { value: "bg-blue-50", label: "Light Blue", preview: "#eff6ff" },
  { value: "bg-green-50", label: "Light Green", preview: "#f0fdf4" },
];


const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};


const ColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: typeof BG_COLOR_OPTIONS;
  label: string;
}> = ({ value, onChange, options, label }) => (
  <div>
    <label className="block text-sm font-mediumtext-neutral-400 mb-2">{label}</label>
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`p-2 rounded-none-lg border-2 flex items-center gap-2 text-sm transition-colors ${
            value === option.value 
              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
          }`}
        >
          <div
            className="w-4 h-4 rounded-none border border-border"
            style={{ backgroundColor: option.preview }}
          />
          <span className="text-gray-200">{option.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const PreviewSection: React.FC<{
  section: TSection;
  sectionIndex: number;
}> = ({ section, sectionIndex }) => (
  <div 
    className={`flex ${section.direction} ${section.justify} ${section.align} ${section.gap} ${section.padding} ${section.margin || ''}`}
  >
    {section.widgets.map((widget, widgetIndex) => (
      <Widget
        key={widget.id}
        type={widget.type}
        props={widget.props}
      />
    ))}
  </div>
);

const SectionEditor: React.FC<{
  section: TSection;
  sectionIndex: number;
  isExpanded: boolean;
  onToggleExpanded: (sectionId: string) => void;
  onUpdateSection: (index: number, updates: Partial<TSection>) => void;
  onDeleteSection: (index: number) => void;
  onAddWidget: (sectionIndex: number, widgetType: string) => void;
  onUpdateWidget: (sectionIndex: number, widgetIndex: number, updates: any) => void;
  onDeleteWidget: (sectionIndex: number, widgetIndex: number) => void;
}> = ({
  section,
  sectionIndex,
  isExpanded,
  onToggleExpanded,
  onUpdateSection,
  onDeleteSection,
  onAddWidget,
  onUpdateWidget,
  onDeleteWidget,
}) => {
  const handleSectionUpdate = useCallback((updates: Partial<TSection>) => {
    onUpdateSection(sectionIndex, updates);
  }, [sectionIndex, onUpdateSection]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-background AAA rounded-none-lg shadow-sm border border-border overflow-hidden"
    >
      {}
      <div className="p-4 bg-muted AAAAborder-b border-border flex items-center justify-between">
        <button
          onClick={() => onToggleExpanded(section.id)}
          className="flex items-center gap-3 text-left flex-1 hover:bg-background AAA/50 p-2 -m-2 rounded-none-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h3 className="font-semibold text-gray-100">
              Section {sectionIndex + 1}
            </h3>
            <p className="text-sm text-gray-400">
              {section.widgets.length} widget{section.widgets.length !== 1 ? 's' : ''}
            </p>
          </div>
        </button>
        
        <button
          onClick={() => onDeleteSection(sectionIndex)}
          className="p-2 text-red-400 hover:bg-red-900/20 rounded-none-lg transition-colors"
          aria-label="Delete section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Direction
                  </label>
                  <select
                    value={section.direction}
                    onChange={(e) => handleSectionUpdate({ direction: e.target.value })}
                    className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
                  >
                    <option value="flex-col">Column</option>
                    <option value="flex-row">Row</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Justify
                  </label>
                  <select
                    value={section.justify}
                    onChange={(e) => handleSectionUpdate({ justify: e.target.value })}
                    className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
                  >
                    <option value="justify-start">Start</option>
                    <option value="justify-center">Center</option>
                    <option value="justify-end">End</option>
                    <option value="justify-between">Between</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Align
                  </label>
                  <select
                    value={section.align}
                    onChange={(e) => handleSectionUpdate({ align: e.target.value })}
                    className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
                  >
                    <option value="items-start">Start</option>
                    <option value="items-center">Center</option>
                    <option value="items-end">End</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Gap
                  </label>
                  <select
                    value={section.gap}
                    onChange={(e) => handleSectionUpdate({ gap: e.target.value })}
                    className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
                  >
                    <option value="gap-1">XS</option>
                    <option value="gap-2">Small</option>
                    <option value="gap-4">Medium</option>
                    <option value="gap-6">Large</option>
                    <option value="gap-8">XL</option>
                    <option value="gap-12">2XL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Padding
                </label>
                <select
                  value={section.padding}
                  onChange={(e) => handleSectionUpdate({ padding: e.target.value })}
                  className="w-full p-2 border border-border rounded-none-lg focus:ring-2   focus:border-transparent max-w-xs bg-background text-foreground"
                >
                  <option value="py-2">Small</option>
                  <option value="py-4">Medium</option>
                  <option value="py-8">Large</option>
                  <option value="py-12">XL</option>
                  <option value="py-16">2XL</option>
                  <option value="py-24">3XL</option>
                </select>
              </div>

              {}
              <div>
                <label className="block text-sm font-mediumtext-neutral-400 mb-3">
                  Add Widget
                </label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(WIDGET_TYPES).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => onAddWidget(sectionIndex, type)}
                      className={`px-3 py-2 ${config.color} text-white text-sm rounded-none-lg hover:opacity-90 transition-opacity`}
                    >
                      + {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="space-y-4">
                {section.widgets.map((widget, widgetIndex) => (
                  <WidgetEditor
                    key={widget.id}
                    widget={widget}
                    sectionIndex={sectionIndex}
                    widgetIndex={widgetIndex}
                    onUpdateWidget={onUpdateWidget}
                    onDeleteWidget={onDeleteWidget}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const WidgetEditor: React.FC<{
  widget: TWidget;
  sectionIndex: number;
  widgetIndex: number;
  onUpdateWidget: (sectionIndex: number, widgetIndex: number, updates: any) => void;
  onDeleteWidget: (sectionIndex: number, widgetIndex: number) => void;
}> = ({ widget, sectionIndex, widgetIndex, onUpdateWidget, onDeleteWidget }) => {
  const handleUpdate = useCallback((updates: any) => {
    onUpdateWidget(sectionIndex, widgetIndex, updates);
  }, [sectionIndex, widgetIndex, onUpdateWidget]);

  return (
    <div className="bg-muted AAAArounded-none-lg p-4 border border-border">
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium text-gray-100 capitalize">
          {WIDGET_TYPES[widget.type as keyof typeof WIDGET_TYPES]?.label || widget.type} Widget
        </span>
        <button
          onClick={() => onDeleteWidget(sectionIndex, widgetIndex)}
          className="p-1 text-red-400 hover:bg-red-900/20 rounded-none transition-colors"
          aria-label="Delete widget"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {(widget.type === 'text' || widget.type === 'heading') && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-mediumtext-neutral-400 mb-2">
              Content
            </label>
            <RichTextEditor
              value={widget.props.text || ""}
              onChange={(value) => handleUpdate({ text: value })}
              placeholder={`Enter your ${widget.type} content...`}
            />
          </div>
          
          {widget.type === "heading" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Level
                </label>
                <select
                  value={widget.props.level || 1}
                  onChange={(e) => handleUpdate({ level: parseInt(e.target.value) })}
                  className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
                >
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <option key={level} value={level}>H{level}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Size
                </label>
                <select
                  value={widget.props.fontSize || "text-2xl"}
                  onChange={(e) => handleUpdate({ fontSize: e.target.value })}
                  className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
                >
                  <option value="text-sm">Small</option>
                  <option value="text-base">Base</option>
                  <option value="text-lg">Large</option>
                  <option value="text-xl">XL</option>
                  <option value="text-2xl">2XL</option>
                  <option value="text-3xl">3XL</option>
                  <option value="text-4xl">4XL</option>
                  <option value="text-5xl">5XL</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {(widget.type === "project" || widget.type === "link" || widget.type === "dynamic") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Text
            </label>
            <input
              type="text"
              value={widget.props.text || ""}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
            />
          </div>
          
          {(widget.type === "project" || widget.type === "link") && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                URL
              </label>
              <input
                type="url"
                value={widget.props.url || ""}
                onChange={(e) => handleUpdate({ url: e.target.value })}
                className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
              />
            </div>
          )}

          {widget.type === "project" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  GitHub Owner
                </label>
                <input
                  type="text"
                  value={widget.props.githubOwner || ""}
                  onChange={(e) => handleUpdate({ githubOwner: e.target.value })}
                  className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
                  placeholder="e.g., remcostoeten"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Repository
                </label>
                <input
                  type="text"
                  value={widget.props.githubRepo || ""}
                  onChange={(e) => handleUpdate({ githubRepo: e.target.value })}
                  className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
                  placeholder="e.g., nextjs-15-roll-your-own-authentication"
                />
              </div>
            </>
          )}

          {widget.type === "dynamic" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type
              </label>
              <select
                value={widget.props.type || "current-time"}
                onChange={(e) => handleUpdate({ type: e.target.value })}
                className="w-full p-2 border border-border rounded-none-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent bg-background text-foreground"
              >
                <option value="current-time">Current Time</option>
                <option value="visitor-count">Visitor Count</option>
                <option value="last-updated">Last Updated</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export function EnhancedAdminCMS() {
  
  const siteConfig = useQuery(api.site.getSiteConfig);
  const pageContent = useQuery(api.site.getPageContent, { pageId: "home" });
  const updateSiteConfig = useMutation(api.site.updateSiteConfig);
  const updatePageContent = useMutation(api.site.updatePageContent);
  const importPageData = useMutation(api.site.importPageData);

  
  const [config, setConfig] = useState<SiteConfig>({
    title: "",
    favicon: "",
    metaDescription: "",
    metaKeywords: "",
    bodyBgColor: "bg-[hsl(0_0%_7%)]",
    bodyFontSize: "text-base",
    bodyFont: "font-sans",
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      twitterCard: "",
    },
  });

  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState("content");
  const [importJson, setImportJson] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  
  const debouncedConfig = useDebounce(config, 1000);
  const debouncedSections = useDebounce(sections, 1000);

  
  useEffect(() => {
    if (siteConfig) {
      setConfig({
        title: siteConfig.title || "",
        favicon: siteConfig.favicon || "",
        metaDescription: siteConfig.metaDescription || "",
        metaKeywords: siteConfig.metaKeywords || "",
        bodyBgColor: siteConfig.bodyBgColor || "bg-[hsl(0_0%_7%)]",
        bodyFontSize: siteConfig.bodyFontSize || "text-base",
        bodyFont: siteConfig.bodyFont || "font-sans",
        seo: {
          title: siteConfig.seo?.title || "",
          description: siteConfig.seo?.description || "",
          keywords: siteConfig.seo?.keywords || "",
          ogImage: siteConfig.seo?.ogImage || "",
          twitterCard: siteConfig.seo?.twitterCard || "",
        },
      });
    }
  }, [siteConfig]);

  useEffect(() => {
    if (pageContent?.sections) {
      
      const sectionsWithIds = pageContent.sections.map(section => ({
        ...section,
        widgets: section.widgets.map((widget: any) => ({
          ...widget,
          id: widget.id || `widget-${Date.now()}-${Math.random()}`
        }))
      }));
      setSections(sectionsWithIds);
      if (sectionsWithIds.length > 0) {
        setExpandedSections(new Set([sectionsWithIds[0].id]));
      }
    }
  }, [pageContent]);

  
  useEffect(() => {
    if (debouncedConfig && siteConfig) {
      handleSaveConfig(true);
    }
  }, [debouncedConfig]);

  useEffect(() => {
    if (debouncedSections.length > 0 && pageContent?.sections) {
      handleSaveContent(true);
    }
  }, [debouncedSections]);

  
  const handleSaveConfig = useCallback(async (isAutoSave = false) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await updateSiteConfig(config);
      if (!isAutoSave) {
        toast.success("Site configuration saved!");
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  }, [config, updateSiteConfig, isLoading]);

  const handleSaveContent = useCallback(async (isAutoSave = false) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await updatePageContent({ pageId: "home", sections });
      if (!isAutoSave) {
        toast.success("Page content saved!");
      }
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setIsLoading(false);
    }
  }, [sections, updatePageContent, isLoading]);

  const addSection = useCallback(() => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      direction: "flex-col",
      justify: "justify-center",
      align: "items-center",
      gap: "gap-8",
      padding: "py-8",
      margin: "",
      widgets: [],
    };
    setSections(prev => [...prev, newSection]);
    setExpandedSections(prev => new Set([...prev, newSection.id]));
  }, []);

  const updateSection = useCallback((index: number, updates: Partial<Section>) => {
    setSections(prev => {
      const newSections = [...prev];
      newSections[index] = { ...newSections[index], ...updates };
      return newSections;
    });
  }, []);

  const deleteSection = useCallback((index: number) => {
    setSections(prev => {
      const sectionId = prev[index]?.id;
      if (sectionId) {
        setExpandedSections(expandedSet => {
          const newSet = new Set(expandedSet);
          newSet.delete(sectionId);
          return newSet;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const addWidget = useCallback((sectionIndex: number, widgetType: string) => {
    const widgetConfig = WIDGET_TYPES[widgetType as keyof typeof WIDGET_TYPES];
    if (!widgetConfig) return;

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      props: { ...widgetConfig.defaultProps },
    };

    setSections(prev => {
      const newSections = [...prev];
      if (newSections[sectionIndex]) {
        newSections[sectionIndex].widgets.push(newWidget);
      }
      return newSections;
    });
  }, []);

  const updateWidget = useCallback((sectionIndex: number, widgetIndex: number, updates: any) => {
    setSections(prev => {
      const newSections = [...prev];
      if (newSections[sectionIndex]?.widgets[widgetIndex]) {
        newSections[sectionIndex].widgets[widgetIndex].props = {
          ...newSections[sectionIndex].widgets[widgetIndex].props,
          ...updates,
        };
      }
      return newSections;
    });
  }, []);

  const deleteWidget = useCallback((sectionIndex: number, widgetIndex: number) => {
    setSections(prev => {
      const newSections = [...prev];
      if (newSections[sectionIndex]) {
        newSections[sectionIndex].widgets.splice(widgetIndex, 1);
      }
      return newSections;
    });
  }, []);

  const handleImport = useCallback(async () => {
    if (!importJson.trim()) {
      toast.error("Please enter JSON data to import");
      return;
    }

    try {
      setIsLoading(true);
      const data = JSON.parse(importJson);
      await importPageData({ pageData: data });
      toast.success("Data imported successfully!");
      setImportJson("");
    } catch (error) {
      toast.error("Failed to import data. Check JSON format.");
    } finally {
      setIsLoading(false);
    }
  }, [importJson, importPageData]);

  const exportData = useCallback(() => {
    const data = {
      page: {
        seo: [config.seo],
        sections: sections,
      },
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("Data copied to clipboard!");
  }, [config.seo, sections]);

  
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "content":
        return (
          <div className="space-y-6">
            {}
            <div className="bg-background AAA p-4 rounded-none-lg shadow-sm border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={addSection}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 cms-button-primary rounded-none-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
                
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-none-lg hover:bg-gray-700 transition-colors"
                >
                  {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {previewMode ? "Edit Mode" : "Preview Mode"}
                </button>
              </div>
              
              <button
                onClick={() => handleSaveContent(false)}
                disabled={isLoading}
                className="cms-button-primary flex items-center gap-2 px-6 py-2 rounded-none-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {}
            {previewMode ? (
              
              <div className="bg-[hsl(0_0%_7%)] rounded-none-lg p-8 border border-border min-h-[600px]">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-none-full text-xs font-medium bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/40">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview Mode
                    </span>
                  </div>
                  
                  {sections.length > 0 ? (
                    <div className="space-y-0">
                      {sections.map((section, sectionIndex) => (
                        <PreviewSection
                          key={section.id}
                          section={section}
                          sectionIndex={sectionIndex}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-4">No content to preview yet.</p>
                      <button
                        onClick={() => setPreviewMode(false)}
                        className="text-[hsl(var(--accent))] hover:opacity-90 underline"
                      >
                        Switch to Edit Mode to add content
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              
              <div className="space-y-4">
                <AnimatePresence>
                  {sections.map((section, sectionIndex) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      sectionIndex={sectionIndex}
                      isExpanded={expandedSections.has(section.id)}
                      onToggleExpanded={toggleSection}
                      onUpdateSection={updateSection}
                      onDeleteSection={deleteSection}
                      onAddWidget={addWidget}
                      onUpdateWidget={updateWidget}
                      onDeleteWidget={deleteWidget}
                    />
                  ))}
                </AnimatePresence>
                
                {sections.length === 0 && (
                  <div className="text-center py-12 bg-background AAA/50 rounded-none-lg border border-dashed border-border">
                    <p className="text-gray-400 mb-4">No sections yet. Add your first section to get started!</p>
                    <button
                      onClick={addSection}
                      className="cms-button-primary inline-flex items-center gap-2 px-4 py-2 rounded-none-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Section
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "site":
        return (
          <div className="bg-background AAA p-8 rounded-none-lg shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-gray-100">Site Configuration</h2>
            
            <div className="space-y-8">
              {}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Basic Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">Site Title</label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                      placeholder="My Portfolio"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">Favicon URL</label>
                    <input
                      type="url"
                      value={config.favicon}
                      onChange={(e) => setConfig({ ...config, favicon: e.target.value })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                      placeholder="https:
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">Meta Description</label>
                    <Textarea
                      value={config.metaDescription}
                      onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
                      className="cms-input w-full p-3 rounded-none-lg"
                      rows={3}
                      placeholder="A brief description of your site for search engines"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">Meta Keywords</label>
                    <input
                      type="text"
                      value={config.metaKeywords}
                      onChange={(e) => setConfig({ ...config, metaKeywords: e.target.value })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                      placeholder="portfolio, developer, react, nextjs"
                    />
                  </div>
                </div>
              </div>

              {}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Style Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ColorPicker
                    value={config.bodyBgColor}
                    onChange={(value) => setConfig({ ...config, bodyBgColor: value })}
                    options={BG_COLOR_OPTIONS}
                    label="Background Color"
                  />
                  
                  <div>
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">Font Family</label>
                    <select
                      value={config.bodyFont}
                      onChange={(e) => setConfig({ ...config, bodyFont: e.target.value })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                    >
                      {FONT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">Base Font Size</label>
                    <select
                      value={config.bodyFontSize}
                      onChange={(e) => setConfig({ ...config, bodyFontSize: e.target.value })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                    >
                      {FONT_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-100">SEO Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">SEO Title</label>
                    <input
                      type="text"
                      value={config.seo.title}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        seo: { ...config.seo, title: e.target.value } 
                      })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                      placeholder="Page title for search engines"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">OG Image URL</label>
                    <input
                      type="url"
                      value={config.seo.ogImage}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        seo: { ...config.seo, ogImage: e.target.value } 
                      })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                      placeholder="https:
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">SEO Description</label>
                    <textarea
                      value={config.seo.description}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        seo: { ...config.seo, description: e.target.value } 
                      })}
                      className="cms-input w-full p-3 rounded-none-lg"
                      rows={3}
                      placeholder="Description for search engines and social media"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">SEO Keywords</label>
                    <input
                      type="text"
                      value={config.seo.keywords}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        seo: { ...config.seo, keywords: e.target.value } 
                      })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                      placeholder="portfolio, web developer, react"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mediumtext-neutral-400 mb-2">Twitter Card</label>
                    <select
                      value={config.seo.twitterCard}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        seo: { ...config.seo, twitterCard: e.target.value } 
                      })}
                      className="w-full p-3 border border-border rounded-none-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100"
                    >
                      <option value="">Select Card Type</option>
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={() => handleSaveConfig(false)}
                disabled={isLoading}
                className="cms-button-primary flex items-center gap-2 px-6 py-3 rounded-none-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        );

      case "import":
        return (
          <div className="bg-background AAA p-8 rounded-none-lg shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-gray-100">Import/Export Data</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-100 mb-3">Import JSON Data</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Import your page configuration and content from a JSON file. This will replace all current content.
                </p>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="cms-input w-full p-4 rounded-none-lg h-64 font-mono text-sm"
                  placeholder="Paste your JSON data here..."
                />
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleImport}
                    disabled={isLoading || !importJson.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-none-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {isLoading ? "Importing..." : "Import Data"}
                  </button>
                  
                  <button
                    onClick={() => setImportJson("")}
                    disabled={!importJson.trim()}
                    className="px-4 py-2 text-gray-300 border border-border rounded-none-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-100 mb-3">Export Current Data</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Export your current page configuration and content as JSON. The data will be copied to your clipboard.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-none-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export to Clipboard
                  </button>
                  
                  <button
                    onClick={() => {
                      const data = {
                        page: {
                          seo: [config.seo],
                          sections: sections,
                        },
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `cms-export-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success("File downloaded!");
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/60 rounded-none-lg hover:bg-[hsl(var(--accent))]/10 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download as File
                  </button>
                </div>
              </div>

              {}
              <div>
                <h3 className="text-lg font-medium text-gray-100 mb-3">Current Data Preview</h3>
                <div className="bg-muted AAAAborder border-border rounded-none-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Sections: {sections.length} | Widgets: {sections.reduce((acc, section) => acc + section.widgets.length, 0)}
                  </div>
                  <pre className="text-xs text-gray-500 overflow-x-auto">
                    {JSON.stringify({ 
                      page: { 
                        seo: [config.seo], 
                        sections: sections.map(s => ({
                          ...s,
                          widgets: s.widgets.map(w => ({ type: w.type, props: Object.keys(w.props) }))
                        }))
                      } 
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [activeTab, sections, expandedSections, config, importJson, isLoading, previewMode, addSection, toggleSection, updateSection, deleteSection, addWidget, updateWidget, deleteWidget, handleSaveContent, handleSaveConfig, handleImport, exportData]);

  return (
    <div className="min-h-screen cms-bg">
      <div className="max-w-7xl mx-auto p-6">
        {}
        <div className="mb-8">
          <h1 className="text-4xl font-bold cms-text mb-2">Content Management System</h1>
          <p className="text-muted-foreground">Create and manage your portfolio content with our enhanced editor</p>
        </div>
        
        {}
        <div className="flex gap-2 mb-8 cms-card p-1 rounded-none-lg shadow-sm">
          {[
            { id: "content", label: "Content Editor", icon: "📝", description: "Manage sections and widgets" },
            { id: "site", label: "Site Settings", icon: "⚙️", description: "Configure site appearance and SEO" },
            { id: "import", label: "Import/Export", icon: "📁", description: "Backup and restore data" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-none-md font-medium transition-all flex-1 text-left ${
                activeTab === tab.id
                  ? "cms-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:cms-text hover:bg-muted"
              }`}
              title={tab.description}
            >
              <span className="text-lg">{tab.icon}</span>
              <div>
                <div className="font-medium">{tab.label}</div>
                <div className={`text-xs ${activeTab === tab.id ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {}
        {isLoading && (
          <div className="fixed top-4 right-4 cms-accent px-4 py-2 rounded-none-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-none-full animate-spin"></div>
              Auto-saving...
            </div>
          </div>
        )}

        {}
        {tabContent}
      </div>
    </div>
  );
}