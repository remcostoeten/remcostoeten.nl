import { useState, useEffect, useCallback, useRef } from "react";
import { SplitPane } from "../shared/components/ui/split-pane";
import { PreviewFrame } from "./preview-frame";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { RichTextEditor } from "./rich-text-editor";
import { LayersPanel } from "./layers-panel";
import { useLayers } from "../shared/hooks/useLayers";
import { TDesignTokens } from "../config/types";
import { cmsConfig, applyDesignTokens } from "../config/cms-config";
import { useKeyboardShortcuts, getModifierKeyText } from "../shared/hooks/useKeyboardShortcuts";
import { FeedbackTable } from "../modules/admin/feedbackcomponents/feedback-table";

type TSection = {
  id: string;
  direction: string;
  justify: string;
  align: string;
  gap: string;
  padding: string;
  margin?: string;
  widgets: TWidget[];
}

type TWidget = {
  type: string;
  props: any;
}

type TSiteConfig = {
  title: string;
  favicon: string;
  metaDescription: string;
  metaKeywords: string;
  bodyBgColor: string;
  bodyFontSize: string;
  bodyFont: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    twitterCard: string;
  };
}

type TTab = {
  id: string;
  label: string;
}

type TContentTabProps = {
  sections: TSection[];
  setSections: React.Dispatch<React.SetStateAction<TSection[]>>;
  addSection: () => void;
  updateSection: (index: number, updates: Partial<TSection>) => void;
  deleteSection: (index: number) => void;
  addWidget: (sectionIndex: number, widgetType: string) => void;
  updateWidget: (sectionIndex: number, widgetIndex: number, updates: any) => void;
  deleteWidget: (sectionIndex: number, widgetIndex: number) => void;
  handleSaveContent: () => Promise<void>;
  isSaving: boolean;
}

function ContentTabWithLayers({
  sections,
  setSections,
  addSection,
  updateSection,
  deleteSection,
  addWidget,
  updateWidget,
  deleteWidget,
  handleSaveContent,
  isSaving
}: TContentTabProps) {
  const [layerSections, layerActions] = useLayers("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitOrientation, setSplitOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [splitRatio, setSplitRatio] = useState(0.5);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className="h-[800px] flex cms-card rounded-none-lg shadow overflow-hidden">
      <LayersPanel
        sections={layerSections}
        selectedId={selectedId}
        onSelectItem={handleSelectItem}
        onToggleVisibility={layerActions.toggleVisibility}
        onToggleLock={layerActions.toggleLock}
        onDeleteItem={(id, type) => {
          layerActions.deleteItems([id]);
          toast.success(`${type === 'section' ? 'Section' : 'Widget'} deleted`);
        }}
        onReorderSections={layerActions.reorderSections}
        onReorderWidgets={layerActions.reorderWidgets}
        onRenameItem={layerActions.rename}
        onToggleCollapse={layerActions.toggleCollapse}
      />
      
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold cms-text">Page Builder</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={addSection}
              className="cms-button-primary px-4 py-2 rounded-none"
            >
              Add Section
            </button>
            <button
              onClick={handleSaveContent}
              disabled={isSaving}
              className="cms-button-primary px-4 py-2 rounded-none disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Content"}
            </button>
            <button
              onClick={() => setIsSplitView(v => !v)}
              className={`px-4 py-2 rounded-none ${isSplitView ? "cms-button-secondary" : "cms-button-secondary"}`}
            >
              {isSplitView ? "Exit Split" : "Split View"}
            </button>
            {isSplitView && (
              <div className="flex gap-1">
                <button
                  onClick={() => setSplitOrientation("vertical")}
                  className={`px-3 py-2 rounded-none ${splitOrientation === "vertical" ? "cms-button-primary" : "cms-button-secondary"}`}
                >
                  Side-by-side
                </button>
                <button
                  onClick={() => setSplitOrientation("horizontal")}
                  className={`px-3 py-2 rounded-none ${splitOrientation === "horizontal" ? "cms-button-primary" : "cms-button-secondary"}`}
                >
                  Stacked
                </button>
              </div>
            )}
          </div>
        </div>

        {isSplitView ? (
          <div className="flex-1 min-h-0">
            <SplitPane
              orientation={splitOrientation}
              initialRatio={splitRatio}
              onRatioChange={(r) => setSplitRatio(r)}
              leftOrTop={
                <div className="h-full overflow-y-auto pr-2">
                  {sections.map((section, sectionIndex) => {
          const layerSection = layerSections.find(s => s.id === section.id);
          const isHidden = layerSection?.visible === false;
          const isLocked = layerSection?.locked === true;
          
          if (isHidden) return null;
          
          return (
            <div 
              key={section.id} 
              className={`cms-muted p-4 mb-4 rounded-none border border-border transition-opacity ${
                isLocked ? 'pointer-events-none opacity-50' : ''
              } ${
                selectedId === section.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedId(section.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold cms-text">
                  {layerSection?.name || `Section ${sectionIndex + 1}`}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(sectionIndex);
                  }}
                  disabled={isLocked}
                  className="cms-button-destructive px-2 py-1 rounded-none text-sm disabled:opacity-30"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <select
                  value={section.direction}
                  onChange={(e) => updateSection(sectionIndex, { direction: e.target.value })}
                  disabled={isLocked}
                  className="cms-input p-2 rounded-none text-sm disabled:opacity-50"
                >
                  <option value="flex-col">Column</option>
                  <option value="flex-row">Row</option>
                </select>
                
                <select
                  value={section.justify}
                  onChange={(e) => updateSection(sectionIndex, { justify: e.target.value })}
                  disabled={isLocked}
                  className="cms-input p-2 rounded-none text-sm disabled:opacity-50"
                >
                  <option value="justify-start">Start</option>
                  <option value="justify-center">Center</option>
                  <option value="justify-end">End</option>
                  <option value="justify-between">Between</option>
                </select>
                
                <select
                  value={section.align}
                  onChange={(e) => updateSection(sectionIndex, { align: e.target.value })}
                  disabled={isLocked}
                  className="cms-input p-2 rounded-none text-sm disabled:opacity-50"
                >
                  <option value="items-start">Start</option>
                  <option value="items-center">Center</option>
                  <option value="items-end">End</option>
                </select>
                
                <select
                  value={section.gap}
                  onChange={(e) => updateSection(sectionIndex, { gap: e.target.value })}
                  disabled={isLocked}
                  className="cms-input p-2 rounded-none text-sm disabled:opacity-50"
                >
                  <option value="gap-2">Gap 2</option>
                  <option value="gap-4">Gap 4</option>
                  <option value="gap-8">Gap 8</option>
                </select>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => addWidget(sectionIndex, "text")}
                  disabled={isLocked}
                  className="cms-button-primary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Text
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "heading")}
                  disabled={isLocked}
                  className="cms-button-primary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Heading
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "highlightedText")}
                  disabled={isLocked}
                  className="cms-button-primary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Highlight
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "project")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Project
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "link")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Link
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "dynamic")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Dynamic
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "contactPopover")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Contact
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "projectPopover")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Project Popover
                </button>
              </div>

              {section.widgets.map((widget, widgetIndex) => {
                const layerWidget = layerSection?.widgets.find(w => w.id === widget.id || (w.type === widget.type && w.props === widget.props));
                const isWidgetHidden = layerWidget?.visible === false;
                const isWidgetLocked = layerWidget?.locked === true;
                
                if (isWidgetHidden) return null;
                
                return (
                  <div 
                    key={widgetIndex} 
                    className={`cms-card p-3 mb-2 rounded-none transition-opacity ${
                      isWidgetLocked ? 'pointer-events-none opacity-50' : ''
                    } ${
                      selectedId === layerWidget?.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (layerWidget?.id) setSelectedId(layerWidget.id);
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize cms-text">
                        {layerWidget?.name || `${widget.type} Widget`}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWidget(sectionIndex, widgetIndex);
                        }}
                        disabled={isWidgetLocked}
                        className="cms-button-destructive px-2 py-1 rounded-none text-xs disabled:opacity-30"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {widget.type !== 'dynamic' && (
                        <div className="col-span-full">
                          <label className="block text-xs font-medium mb-1 cms-text">Text</label>
                          {widget.type === 'text' || widget.type === 'highlightedText' ? (
                            <RichTextEditor
                              value={widget.props.text || ""}
                              onChange={(newText) => updateWidget(sectionIndex, widgetIndex, { text: newText })}
                              placeholder="Enter your text here..."
                              className="min-h-[100px]"
                            />
                          ) : (
                            <input
                              type="text"
                              value={widget.props.text || ""}
                              onChange={(e) => updateWidget(sectionIndex, widgetIndex, { text: e.target.value })}
                              disabled={isWidgetLocked}
                              className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                            />
                          )}
                        </div>
                      )}
                      
                      {widget.type === "heading" && (
                        <div>
                          <label className="block text-xs font-medium mb-1 cms-text">Level</label>
                          <select
                            value={widget.props.level || 1}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { level: parseInt(e.target.value) })}
                            disabled={isWidgetLocked}
                            className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                          >
                            <option value={1}>H1</option>
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                            <option value={4}>H4</option>
                            <option value={5}>H5</option>
                            <option value={6}>H6</option>
                          </select>
                        </div>
                      )}
                      
                      {(widget.type === "project" || widget.type === "link") && (
                        <div>
                          <label className="block text-xs font-medium mb-1 cms-text">URL</label>
                          <input
                            type="text"
                            value={widget.props.url || ""}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { url: e.target.value })}
                            disabled={isWidgetLocked}
                            className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                          />
                        </div>
                      )}

                      {widget.type === "project" && (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-1 cms-text">GitHub Owner</label>
                            <input
                              type="text"
                              value={widget.props.githubOwner || ""}
                              onChange={(e) => updateWidget(sectionIndex, widgetIndex, { githubOwner: e.target.value })}
                              disabled={isWidgetLocked}
                              className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                              placeholder="e.g., remcostoeten"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 cms-text">GitHub Repo</label>
                            <input
                              type="text"
                              value={widget.props.githubRepo || ""}
                              onChange={(e) => updateWidget(sectionIndex, widgetIndex, { githubRepo: e.target.value })}
                              disabled={isWidgetLocked}
                              className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                              placeholder="e.g., nextjs-15-roll-your-own-authentication"
                            />
                          </div>
                        </>
                      )}

                      {widget.type === "dynamic" && (
                        <div>
                          <label className="block text-xs font-medium mb-1 cms-text">Dynamic Type</label>
                          <select
                            value={widget.props.type || "current-time"}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { type: e.target.value })}
                            disabled={isWidgetLocked}
                            className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                          >
                            <option value="current-time">Current Time</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
                </div>
              }
              rightOrBottom={
                <div className="h-full">
                  <PreviewFrame url="/" />
                </div>
              }
            />
          </div>
        ) : (
          <>
        {sections.map((section, sectionIndex) => {
          const layerSection = layerSections.find(s => s.id === section.id);
          const isHidden = layerSection?.visible === false;
          const isLocked = layerSection?.locked === true;
          
          if (isHidden) return null;
          
          return (
            <div 
              key={section.id} 
              className={`cms-muted p-4 mb-4 rounded-none border border-border transition-opacity ${
                isLocked ? 'pointer-events-none opacity-50' : ''
              } ${
                selectedId === section.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedId(section.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold cms-text">
                  {layerSection?.name || `Section ${sectionIndex + 1}`}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(sectionIndex);
                  }}
                  disabled={isLocked}
                  className="cms-button-destructive px-2 py-1 rounded-none text-sm disabled:opacity-30"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <select
                  value={section.direction}
                  onChange={(e) => updateSection(sectionIndex, { direction: e.target.value })}
                  disabled={isLocked}
                  className="cms-input p-2 rounded-none text-sm disabled:opacity-50"
                >
                  <option value="flex-col">Column</option>
                  <option value="flex-row">Row</option>
                </select>
                
                <select
                  value={section.justify}
                  onChange={(e) => updateSection(sectionIndex, { justify: e.target.value })}
                  disabled={isLocked}
                  className="cms-input p-2 rounded-none text-sm disabled:opacity-50"
                >
                  <option value="justify-start">Start</option>
                  <option value="justify-center">Center</option>
                  <option value="justify-end">End</option>
                  <option value="justify-between">Between</option>
                </select>
                
                <select
                  value={section.align}
                  onChange={(e) => updateSection(sectionIndex, { align: e.target.value })}
                  disabled={isLocked}
                  className="cms-input p-2 rounded-none text-sm disabled:opacity-50"
                >
                  <option value="items-start">Start</option>
                  <option value="items-center">Center</option>
                  <option value="items-end">End</option>
                </select>
                
                <select
                  value={section.gap}
                  onChange={(e) => updateSection(sectionIndex, { gap: e.target.value })}
                  disabled={isLocked}
                  className="cms-input p-2 rounded-none text-sm disabled:opacity-50"
                >
                  <option value="gap-2">Gap 2</option>
                  <option value="gap-4">Gap 4</option>
                  <option value="gap-8">Gap 8</option>
                </select>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => addWidget(sectionIndex, "text")}
                  disabled={isLocked}
                  className="cms-button-primary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Text
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "heading")}
                  disabled={isLocked}
                  className="cms-button-primary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Heading
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "highlightedText")}
                  disabled={isLocked}
                  className="cms-button-primary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Highlight
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "project")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Project
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "link")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Link
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "dynamic")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Dynamic
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "contactPopover")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Contact
                </button>
                <button
                  onClick={() => addWidget(sectionIndex, "projectPopover")}
                  disabled={isLocked}
                  className="cms-button-secondary px-3 py-1 rounded-none text-sm disabled:opacity-50"
                >
                  Add Project Popover
                </button>
              </div>

              {section.widgets.map((widget, widgetIndex) => {
                const layerWidget = layerSection?.widgets.find(w => w.id === widget.id || (w.type === widget.type && w.props === widget.props));
                const isWidgetHidden = layerWidget?.visible === false;
                const isWidgetLocked = layerWidget?.locked === true;
                
                if (isWidgetHidden) return null;
                
                return (
                  <div 
                    key={widgetIndex} 
                    className={`cms-card p-3 mb-2 rounded-none transition-opacity ${
                      isWidgetLocked ? 'pointer-events-none opacity-50' : ''
                    } ${
                      selectedId === layerWidget?.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (layerWidget?.id) setSelectedId(layerWidget.id);
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize cms-text">
                        {layerWidget?.name || `${widget.type} Widget`}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWidget(sectionIndex, widgetIndex);
                        }}
                        disabled={isWidgetLocked}
                        className="cms-button-destructive px-2 py-1 rounded-none text-xs disabled:opacity-30"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {widget.type !== 'dynamic' && (
                        <div className="col-span-full">
                          <label className="block text-xs font-medium mb-1 cms-text">Text</label>
                          {widget.type === 'text' || widget.type === 'highlightedText' ? (
                            <RichTextEditor
                              value={widget.props.text || ""}
                              onChange={(newText) => updateWidget(sectionIndex, widgetIndex, { text: newText })}
                              placeholder="Enter your text here..."
                              className="min-h-[100px]"
                            />
                          ) : (
                            <input
                              type="text"
                              value={widget.props.text || ""}
                              onChange={(e) => updateWidget(sectionIndex, widgetIndex, { text: e.target.value })}
                              disabled={isWidgetLocked}
                              className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                            />
                          )}
                        </div>
                      )}
                      
                      {widget.type === "heading" && (
                        <div>
                          <label className="block text-xs font-medium mb-1 cms-text">Level</label>
                          <select
                            value={widget.props.level || 1}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { level: parseInt(e.target.value) })}
                            disabled={isWidgetLocked}
                            className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                          >
                            <option value={1}>H1</option>
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                            <option value={4}>H4</option>
                            <option value={5}>H5</option>
                            <option value={6}>H6</option>
                          </select>
                        </div>
                      )}
                      
                      {(widget.type === "project" || widget.type === "link") && (
                        <div>
                          <label className="block text-xs font-medium mb-1 cms-text">URL</label>
                          <input
                            type="text"
                            value={widget.props.url || ""}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { url: e.target.value })}
                            disabled={isWidgetLocked}
                            className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                          />
                        </div>
                      )}

                      {widget.type === "project" && (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-1 cms-text">GitHub Owner</label>
                            <input
                              type="text"
                              value={widget.props.githubOwner || ""}
                              onChange={(e) => updateWidget(sectionIndex, widgetIndex, { githubOwner: e.target.value })}
                              disabled={isWidgetLocked}
                              className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                              placeholder="e.g., remcostoeten"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 cms-text">GitHub Repo</label>
                            <input
                              type="text"
                              value={widget.props.githubRepo || ""}
                              onChange={(e) => updateWidget(sectionIndex, widgetIndex, { githubRepo: e.target.value })}
                              disabled={isWidgetLocked}
                              className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                              placeholder="e.g., nextjs-15-roll-your-own-authentication"
                            />
                          </div>
                        </>
                      )}

                      {widget.type === "dynamic" && (
                        <div>
                          <label className="block text-xs font-medium mb-1 cms-text">Dynamic Type</label>
                          <select
                            value={widget.props.type || "current-time"}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { type: e.target.value })}
                            disabled={isWidgetLocked}
                            className="cms-input w-full p-1 rounded-none text-sm disabled:opacity-50"
                          >
                            <option value="current-time">Current Time</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center py-8">
            <p className="text-zinc-600 mb-4">No sections yet</p>
            <button
              onClick={addSection}
              className="cms-button-primary px-4 py-2 rounded-none"
            >
              Add Your First Section
            </button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

export function AdminCMS() {
  const siteConfig = useQuery(api.site.getSiteConfig);
  const pageContent = useQuery(api.site.getPageContent, { pageId: "home" });
  const submissions = useQuery(api.submissions.get);
  const updateSiteConfig = useMutation(api.site.updateSiteConfig);
  const updatePageContent = useMutation(api.site.updatePageContent);
  const importPageData = useMutation(api.site.importPageData);
  const updateTabOrder = useMutation(api.site.updateTabOrder);
  const updateActiveTab = useMutation(api.site.updateActiveTab);

  const [config, setConfig] = useState<TSiteConfig>({
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

  const [sections, setSections] = useState<TSection[]>([]);
  const [designTokens, setDesignTokens] = useState<TDesignTokens>(cmsConfig.designTokens);
  const [activeTab, setActiveTab] = useState("submissions");
  const [importJson, setImportJson] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  const defaultTabs: TTab[] = [
    { id: "submissions", label: "Submissions" },
    { id: "site", label: "Site Settings" },
    { id: "content", label: "Page Builder" },
    { id: "import", label: "Import/Export" },
  ];
  
  const [tabs, setTabs] = useState<TTab[]>(defaultTabs);
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [draggedOverTab, setDraggedOverTab] = useState<string | null>(null);
  
  // Use refs to track if data has been loaded from server
  const configLoadedRef = useRef(false);
  const sectionsLoadedRef = useRef(false);
  
  // Track manual save state
  const [lastManualSave, setLastManualSave] = useState<Date | null>(null);

  useEffect(() => {
    if (siteConfig && !configLoadedRef.current) {
      setConfig({
        title: siteConfig.title,
        favicon: siteConfig.favicon || "",
        metaDescription: siteConfig.metaDescription || "",
        metaKeywords: siteConfig.metaKeywords || "",
        bodyBgColor: siteConfig.bodyBgColor,
        bodyFontSize: siteConfig.bodyFontSize,
        bodyFont: siteConfig.bodyFont,
        seo: {
          title: siteConfig.seo?.title || "",
          description: siteConfig.seo?.description || "",
          keywords: siteConfig.seo?.keywords || "",
          ogImage: siteConfig.seo?.ogImage || "",
          twitterCard: siteConfig.seo?.twitterCard || "",
        },
      });
      
      if (siteConfig.designTokens) {
        setDesignTokens(siteConfig.designTokens);
      }
      
      configLoadedRef.current = true;
      
      if (siteConfig.cmsTabOrder && siteConfig.cmsTabOrder.length > 0) {
        const orderedTabs = siteConfig.cmsTabOrder.map(id => {
          const tab = defaultTabs.find(t => t.id === id);
          return tab || null;
        }).filter(Boolean) as TTab[];
        
        const missingTabs = defaultTabs.filter(
          tab => !siteConfig.cmsTabOrder?.includes(tab.id)
        );
        
        setTabs([...orderedTabs, ...missingTabs]);
      }
      
      if (siteConfig.activeTab) {
        setActiveTab(siteConfig.activeTab);
      }
    }
  }, [siteConfig]);

  useEffect(() => {
    if (pageContent && !sectionsLoadedRef.current) {
      setSections(pageContent.sections);
      sectionsLoadedRef.current = true;
    }
  }, [pageContent]);

  // Apply design tokens live for instant preview
  useEffect(() => {
    if (configLoadedRef.current) {
      applyDesignTokens(designTokens);
    }
  }, [designTokens]);

  // Track changes
  useEffect(() => {
    if (configLoadedRef.current || sectionsLoadedRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [config, sections, designTokens]);

  const handleSaveConfig = useCallback(async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      await updateSiteConfig({ ...config, designTokens });
      toast.success("Site configuration saved!");
      setHasUnsavedChanges(false);
      setLastManualSave(new Date());
      setLastSavedAt(new Date());
    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  }, [config, designTokens, updateSiteConfig, isSaving]);

  const handleSaveContent = useCallback(async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      await updatePageContent({ pageId: "home", sections });
      toast.success("Page content saved!");
      setHasUnsavedChanges(false);
      setLastManualSave(new Date());
      setLastSavedAt(new Date());
    } catch (error) {
      console.error("Failed to save content:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  }, [sections, updatePageContent, isSaving]);

  function addSection() {
    const sectionCount = sections.length + 1;
    const newSection: TSection = {
      id: `section-${Date.now()}`,
      direction: "flex-col",
      justify: "justify-start",
      align: "items-start",
      gap: "gap-4",
      padding: "py-8",
      margin: "",
      widgets: [],
    };
    setSections([...sections, newSection]);
  }

  function updateSection(index: number, updates: Partial<TSection>) {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSections(newSections);
  }

  function deleteSection(index: number) {
    setSections(sections.filter((_, i) => i !== index));
  }

  function addWidget(sectionIndex: number, widgetType: string) {
    const defaultProps = {
      text: {
        text: "Sample text",
        fontSize: "text-base",
        fontWeight: "font-normal",
        color: "text-[hsl(var(--foreground))]",
        textAlign: "text-left",
      },
      heading: {
        text: "Sample Heading",
        level: 1,
        fontSize: "text-2xl",
        fontWeight: "font-bold",
        color: "text-[hsl(var(--foreground))]",
        textAlign: "text-left",
      },
      highlightedText: {
        text: "Highlighted Text",
        fontSize: "text-base",
        fontWeight: "font-normal",
      },
      coloredTextLink: {
        text: "Link Text",
        href: "#",
        target: "_self",
        fontSize: "text-base",
        fontWeight: "font-normal",
      },
      project: {
        text: "Project Name",
        url: "https://example.com",
        fontSize: "text-base",
        githubOwner: "",
        githubRepo: "",
      },
      link: {
        text: "Link Text",
        url: "https://example.com",
        fontSize: "text-base",
        fontWeight: "font-normal",
      },
      dynamic: {
        type: "current-time",
      },
      contactPopover: {
        label: "Contact Me",
      },
      projectPopover: {
        title: "Sample Project",
        description: "A sample project description",
        url: "https://github.com/username/repo",
        demoUrl: "",
        stars: 0,
        branches: 1,
        technologies: ["TypeScript", "React"],
        lastUpdated: "recently",
        highlights: ["Feature 1", "Feature 2"],
      },
    };

    const newWidget: TWidget = {
      type: widgetType,
      props: defaultProps[widgetType as keyof typeof defaultProps] || {},
    };

    const newSections = [...sections];
    newSections[sectionIndex].widgets.push(newWidget);
    setSections(newSections);
  }

  function updateWidget(sectionIndex: number, widgetIndex: number, updates: any) {
    const newSections = [...sections];
    newSections[sectionIndex].widgets[widgetIndex].props = {
      ...newSections[sectionIndex].widgets[widgetIndex].props,
      ...updates,
    };
    setSections(newSections);
  }

  function deleteWidget(sectionIndex: number, widgetIndex: number) {
    const newSections = [...sections];
    newSections[sectionIndex].widgets.splice(widgetIndex, 1);
    setSections(newSections);
  }

  const handleImport = async () => {
    try {
      const data = JSON.parse(importJson);
      await importPageData({ pageData: data });
      toast.success("Data imported successfully!");
      setImportJson("");
      // Reload the page to get fresh data
      window.location.reload();
    } catch (error) {
      toast.error("Failed to import data. Check JSON format.");
    }
  };

  function exportData() {
    const data = {
      page: {
        seo: [config.seo],
        sections: sections,
      },
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("Data copied to clipboard!");
  }
  
  function handleDragStart(tabId: string) {
    setDraggedTab(tabId);
  }
  
  function handleDragOver(e: React.DragEvent, tabId: string) {
    e.preventDefault();
    setDraggedOverTab(tabId);
  }
  
  function handleDragEnd() {
    setDraggedTab(null);
    setDraggedOverTab(null);
  }
  
  async function handleDrop(e: React.DragEvent, droppedOnTabId: string) {
    e.preventDefault();
    
    if (!draggedTab || draggedTab === droppedOnTabId) {
      setDraggedTab(null);
      setDraggedOverTab(null);
      return;
    }
    
    const draggedIndex = tabs.findIndex(t => t.id === draggedTab);
    const droppedIndex = tabs.findIndex(t => t.id === droppedOnTabId);
    
    const newTabs = [...tabs];
    const [removed] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(droppedIndex, 0, removed);
    
    setTabs(newTabs);
    setDraggedTab(null);
    setDraggedOverTab(null);
    
    try {
      await updateTabOrder({ tabOrder: newTabs.map(t => t.id) });
      toast.success("Tab order saved!");
    } catch (error) {
      console.error("Failed to save tab order:", error);
      toast.error("Failed to save tab order");
    }
  }
  
  async function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    
    try {
      await updateActiveTab({ activeTab: tabId });
    } catch (error) {
      console.error("Failed to save active tab:", error);
    }
  }

  useKeyboardShortcuts([
    {
      key: 's',
      meta: true,
      ctrl: false,
      handler: () => {
        if (activeTab === 'site') {
          handleSaveConfig();
        } else if (activeTab === 'content') {
          handleSaveContent();
        }
      }
    },
    {
      key: 's',
      ctrl: true,
      meta: false,
      handler: () => {
        if (activeTab === 'site') {
          handleSaveConfig();
        } else if (activeTab === 'content') {
          handleSaveContent();
        }
      }
    }
  ]);
  
  return (
    <div className="min-h-screen cms-bg cms-text p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold cms-text">Admin CMS</h1>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges ? (
              <span className="text-yellow-500 text-sm">● Unsaved changes</span>
            ) : (
              lastSavedAt && <span className="text-green-500 text-sm">✓ Saved</span>
            )}
            <span className="text-xs text-muted-foreground">Shortcut: {getModifierKeyText()}+S</span>
            {isSaving && <span className="text-blue-500 text-sm">Saving...</span>}
          </div>
        </div>
        
        <div className="flex gap-2 mb-6 items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              draggable
              onDragStart={() => handleDragStart(tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, tab.id)}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-none transition-all cursor-move relative ${
                activeTab === tab.id 
                  ? "cms-button-primary" 
                  : "cms-button-secondary"
              } ${
                draggedTab === tab.id ? "opacity-50" : ""
              } ${
                draggedOverTab === tab.id && draggedTab !== tab.id
                  ? "ring-2 ring-blue-500 ring-offset-2"
                  : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <svg 
                  className="w-3 h-3 opacity-50" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                </svg>
                {tab.label}
              </span>
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-2">
            (Drag to reorder)
          </span>
        </div>

        {activeTab === "submissions" && (
          <div className="cms-card p-6 rounded-none-lg shadow">
            <h2 className="text-xl font-semibold mb-4 cms-text">Contact Form Submissions</h2>
            
            {/* Debug info */}
            <div className="mb-4 p-2 bg-muted/20 rounded text-xs">
              <span className="text-muted-foreground">
                Debug: {submissions === undefined ? 'Loading...' : `Found ${submissions?.length || 0} submissions`}
              </span>
            </div>
            
            <FeedbackTable submissions={submissions} />
          </div>
        )}

        {activeTab === "site" && (
          <div className="cms-card p-6 rounded-none-lg shadow">
            <h2 className="text-xl font-semibold mb-4 cms-text">Site Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">Site Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="cms-input w-full p-2 rounded-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">Favicon URL</label>
                <input
                  type="text"
                  value={config.favicon}
                  onChange={(e) => setConfig({ ...config, favicon: e.target.value })}
                  className="cms-input w-full p-2 rounded-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">Meta Description</label>
                <textarea
                  value={config.metaDescription}
                  onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
                  className="cms-input w-full p-2 rounded-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">Meta Keywords</label>
                <input
                  type="text"
                  value={config.metaKeywords}
                  onChange={(e) => setConfig({ ...config, metaKeywords: e.target.value })}
                  className="cms-input w-full p-2 rounded-none"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4 cms-text">SEO Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">SEO Title</label>
                <input
                  type="text"
                  value={config.seo.title}
                  onChange={(e) => setConfig({ ...config, seo: { ...config.seo, title: e.target.value } })}
                  className="cms-input w-full p-2 rounded-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">SEO Description</label>
                <textarea
                  value={config.seo.description}
                  onChange={(e) => setConfig({ ...config, seo: { ...config.seo, description: e.target.value } })}
                  className="cms-input w-full p-2 rounded-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">OG Image URL</label>
                <input
                  type="text"
                  value={config.seo.ogImage}
                  onChange={(e) => setConfig({ ...config, seo: { ...config.seo, ogImage: e.target.value } })}
                  className="cms-input w-full p-2 rounded-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">Twitter Card</label>
                <select
                  value={config.seo.twitterCard}
                  onChange={(e) => setConfig({ ...config, seo: { ...config.seo, twitterCard: e.target.value } })}
                  className="cms-input w-full p-2 rounded-none"
                >
                  <option value="">Select Card Type</option>
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                </select>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-4 cms-text">Layout Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 cms-text">Container Max Width</label>
                <input
                  type="text"
                  value={designTokens.layout.containerMaxWidth}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow any input while typing, validation happens on blur/save
                    setDesignTokens({
                      ...designTokens,
                      layout: {
                        ...designTokens.layout,
                        containerMaxWidth: value
                      }
                    });
                  }}
                  className="cms-input w-full p-2 rounded-none"
                  placeholder="e.g., 1200px, 100vw, 80%"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Accepts pixel values (px), percentages (%), or viewport width (vw). Examples: 1200px, 100vw, 80%
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  💡 Tip: Open <a href="/" target="_blank" className="underline hover:text-blue-300">homepage</a> in another tab to see live preview while you type!
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="mt-4 cms-button-primary px-4 py-2 rounded-none disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        )}

        {activeTab === "content" && (
          <ContentTabWithLayers 
            sections={sections} 
            setSections={setSections}
            addSection={addSection}
            updateSection={updateSection}
            deleteSection={deleteSection}
            addWidget={addWidget}
            updateWidget={updateWidget}
            deleteWidget={deleteWidget}
            handleSaveContent={handleSaveContent}
            isSaving={isSaving}
          />
        )}

        {activeTab === "import" && (
          <div className="cms-card p-6 rounded-none-lg shadow">
            <h2 className="text-xl font-semibold mb-4 cms-text">Import/Export</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 cms-text">Import JSON</label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="cms-input w-full p-2 rounded-none h-32"
                placeholder="Paste your JSON data here..."
              />
              <button
                onClick={handleImport}
                className="mt-2 cms-button-primary px-4 py-2 rounded-none"
              >
                Import Data
              </button>
            </div>
            
            <div>
              <button
                onClick={exportData}
                className="cms-button-primary px-4 py-2 rounded-none"
              >
                Export Current Data
              </button>
              <p className="text-sm text-muted-foreground mt-2">
                Exports current page data to clipboard as JSON
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
