import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

type TSection {
  id: string;
  direction: string;
  justify: string;
  align: string;
  gap: string;
  padding: string;
  margin?: string;
  widgets: Widget[];
}

type TWidget {
  type: string;
  props: any;
}

export function AdminCMS() {
  const siteConfig = useQuery(api.site.getSiteConfig);
  const pageContent = useQuery(api.site.getPageContent, { pageId: "home" });
  const submissions = useQuery(api.submissions.get);
  const updateSiteConfig = useMutation(api.site.updateSiteConfig);
  const updatePageContent = useMutation(api.site.updatePageContent);
  const importPageData = useMutation(api.site.importPageData);

  const [config, setConfig] = useState({
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
  const [activeTab, setActiveTab] = useState("submissions");
  const [importJson, setImportJson] = useState("");

  useEffect(() => {
    if (siteConfig) {
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
    }
  }, [siteConfig]);

  useEffect(() => {
    if (pageContent) {
      setSections(pageContent.sections);
    }
  }, [pageContent]);

  const handleSaveConfig = async () => {
    try {
      await updateSiteConfig(config);
      toast.success("Site configuration saved!");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  const handleSaveContent = async () => {
    try {
      await updatePageContent({ pageId: "home", sections });
      toast.success("Page content saved!");
    } catch (error) {
      toast.error("Failed to save content");
    }
  };

  function addSection() {
    const newSection: Section = {
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
  };

  function updateSection(index: number, updates: Partial<Section>) {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSections(newSections);
  };

  function deleteSection(index: number) {
    setSections(sections.filter((_, i) => i !== index));
  };

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
        url: "https:
        fontSize: "text-base",
        githubOwner: "",
        githubRepo: "",
      },
      link: {
        text: "Link Text",
        url: "https:
        fontSize: "text-base",
        fontWeight: "font-normal",
      },
      dynamic: {
        type: "current-time",
      },
    };

    const newWidget: Widget = {
      type: widgetType,
      props: defaultProps[widgetType as keyof typeof defaultProps] || {},
    };

    const newSections = [...sections];
    newSections[sectionIndex].widgets.push(newWidget);
    setSections(newSections);
  };

  function updateWidget(sectionIndex: number, widgetIndex: number, updates: any) {
    const newSections = [...sections];
    newSections[sectionIndex].widgets[widgetIndex].props = {
      ...newSections[sectionIndex].widgets[widgetIndex].props,
      ...updates,
    };
    setSections(newSections);
  };

  function deleteWidget(sectionIndex: number, widgetIndex: number) {
    const newSections = [...sections];
    newSections[sectionIndex].widgets.splice(widgetIndex, 1);
    setSections(newSections);
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importJson);
      await importPageData({ pageData: data });
      toast.success("Data imported successfully!");
      setImportJson("");
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
  };

  return (
    <div className="min-h-screen cms-bg cms-text p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 cms-text">Admin CMS</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-none transition-colors ${
              activeTab === "submissions" 
                ? "cms-button-primary" 
                : "cms-button-secondary"
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setActiveTab("site")}
            className={`px-4 py-2 rounded-none transition-colors ${
              activeTab === "site" 
                ? "cms-button-primary" 
                : "cms-button-secondary"
            }`}
          >
            Site Settings
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 rounded-none transition-colors ${
              activeTab === "content" 
                ? "cms-button-primary" 
                : "cms-button-secondary"
            }`}
          >
            Page Builder
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-2 rounded-none transition-colors ${
              activeTab === "import" 
                ? "cms-button-primary" 
                : "cms-button-secondary"
            }`}
          >
            Import/Export
          </button>
        </div>

        {activeTab === "submissions" && (
          <div className="cms-card p-6 rounded-none-lg shadow">
            <h2 className="text-xl font-semibold mb-4 cms-text">Contact Form Submissions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full cms-card">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-border cms-text">Name</th>
                    <th className="py-2 px-4 border-b border-border cms-text">Feedback</th>
                    <th className="py-2 px-4 border-b border-border cms-text">Emoji</th>
                    <th className="py-2 px-4 border-b border-border cms-text">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions?.map((submission) => (
                    <tr key={submission._id}>
                      <td className="py-2 px-4 border-b border-border cms-text">{submission.name}</td>
                      <td className="py-2 px-4 border-b border-border cms-text">{submission.feedback}</td>
                      <td className="py-2 px-4 border-b border-border cms-text">{submission.emoji}</td>
                      <td className="py-2 px-4 border-b border-border cms-text">{new Date(submission._creationTime).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            
            <button
              onClick={handleSaveConfig}
              className="mt-4 cms-button-primary px-4 py-2 rounded-none"
            >
              Save Configuration
            </button>
          </div>
        )}

        {activeTab === "content" && (
          <div className="bg-white p-6 rounded-none-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Page Builder</h2>
              <div className="flex gap-2">
                <button
                  onClick={addSection}
                  className="bg-green-500 text-white px-4 py-2 rounded-none hover:bg-green-600"
                >
                  Add Section
                </button>
                <button
                  onClick={handleSaveContent}
                  className="bg-blue-500 text-white px-4 py-2 rounded-none hover:bg-blue-600"
                >
                  Save Content
                </button>
              </div>
            </div>

            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="border p-4 mb-4 rounded-none">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Section {sectionIndex + 1}</h3>
                  <button
                    onClick={() => deleteSection(sectionIndex)}
                    className="bg-red-500 text-white px-2 py-1 rounded-none text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <select
                    value={section.direction}
                    onChange={(e) => updateSection(sectionIndex, { direction: e.target.value })}
                    className="p-2 border rounded-none text-sm"
                  >
                    <option value="flex-col">Column</option>
                    <option value="flex-row">Row</option>
                  </select>
                  
                  <select
                    value={section.justify}
                    onChange={(e) => updateSection(sectionIndex, { justify: e.target.value })}
                    className="p-2 border rounded-none text-sm"
                  >
                    <option value="justify-start">Start</option>
                    <option value="justify-center">Center</option>
                    <option value="justify-end">End</option>
                    <option value="justify-between">Between</option>
                  </select>
                  
                  <select
                    value={section.align}
                    onChange={(e) => updateSection(sectionIndex, { align: e.target.value })}
                    className="p-2 border rounded-none text-sm"
                  >
                    <option value="items-start">Start</option>
                    <option value="items-center">Center</option>
                    <option value="items-end">End</option>
                  </select>
                  
                  <select
                    value={section.gap}
                    onChange={(e) => updateSection(sectionIndex, { gap: e.target.value })}
                    className="p-2 border rounded-none text-sm"
                  >
                    <option value="gap-2">Gap 2</option>
                    <option value="gap-4">Gap 4</option>
                    <option value="gap-8">Gap 8</option>
                  </select>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  <button
                    onClick={() => addWidget(sectionIndex, "text")}
                    className="bg-blue-500 text-white px-3 py-1 rounded-none text-sm"
                  >
                    Add Text
                  </button>
                  <button
                    onClick={() => addWidget(sectionIndex, "heading")}
                    className="bg-blue-500 text-white px-3 py-1 rounded-none text-sm"
                  >
                    Add Heading
                  </button>
                  <button
                    onClick={() => addWidget(sectionIndex, "highlightedText")}
                    className="bg-blue-500 text-white px-3 py-1 rounded-none text-sm"
                  >
                    Add Highlight
                  </button>
                  <button
                    onClick={() => addWidget(sectionIndex, "project")}
                    className="bg-purple-500 text-white px-3 py-1 rounded-none text-sm"
                  >
                    Add Project
                  </button>
                  <button
                    onClick={() => addWidget(sectionIndex, "link")}
                    className="bg-green-500 text-white px-3 py-1 rounded-none text-sm"
                  >
                    Add Link
                  </button>
                  <button
                    onClick={() => addWidget(sectionIndex, "dynamic")}
                    className="bg-orange-500 text-white px-3 py-1 rounded-none text-sm"
                  >
                    Add Dynamic
                  </button>
                </div>

                {section.widgets.map((widget, widgetIndex) => (
                  <div key={widgetIndex} className="bg-gray-50 p-3 mb-2 rounded-none">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{widget.type}</span>
                      <button
                        onClick={() => deleteWidget(sectionIndex, widgetIndex)}
                        className="bg-red-500 text-white px-2 py-1 rounded-none text-xs"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {widget.type !== 'dynamic' && (
                        <div>
                          <label className="block text-xs font-medium mb-1">Text</label>
                          <input
                            type="text"
                            value={widget.props.text || ""}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { text: e.target.value })}
                            className="w-full p-1 border rounded-none text-sm"
                          />
                        </div>
                      )}
                      
                      {widget.type === "heading" && (
                        <div>
                          <label className="block text-xs font-medium mb-1">Level</label>
                          <select
                            value={widget.props.level || 1}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { level: parseInt(e.target.value) })}
                            className="w-full p-1 border rounded-none text-sm"
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
                          <label className="block text-xs font-medium mb-1">URL</label>
                          <input
                            type="text"
                            value={widget.props.url || ""}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { url: e.target.value })}
                            className="w-full p-1 border rounded-none text-sm"
                          />
                        </div>
                      )}

                      {widget.type === "project" && (
                        <div>
                          <label className="block text-xs font-medium mb-1">GitHub Owner</label>
                          <input
                            type="text"
                            value={widget.props.githubOwner || ""}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { githubOwner: e.target.value })}
                            className="w-full p-1 border rounded-none text-sm"
                            placeholder="e.g., remcostoeten"
                          />
                        </div>
                      )}

                      {widget.type === "project" && (
                        <div>
                          <label className="block text-xs font-medium mb-1">GitHub Repo</label>
                          <input
                            type="text"
                            value={widget.props.githubRepo || ""}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { githubRepo: e.target.value })}
                            className="w-full p-1 border rounded-none text-sm"
                            placeholder="e.g., nextjs-15-roll-your-own-authentication"
                          />
                        </div>
                      )}

                      {widget.type === "dynamic" && (
                        <div>
                          <label className="block text-xs font-medium mb-1">Dynamic Type</label>
                          <select
                            value={widget.props.type || "current-time"}
                            onChange={(e) => updateWidget(sectionIndex, widgetIndex, { type: e.target.value })}
                            className="w-full p-1 border rounded-none text-sm"
                          >
                            <option value="current-time">Current Time</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "import" && (
          <div className="bg-white p-6 rounded-none-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Import/Export</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Import JSON</label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full p-2 border rounded-none h-32"
                placeholder="Paste your JSON data here..."
              />
              <button
                onClick={handleImport}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded-none hover:bg-green-600"
              >
                Import Data
              </button>
            </div>
            
            <div>
              <button
                onClick={exportData}
                className="bg-blue-500 text-white px-4 py-2 rounded-none hover:bg-blue-600"
              >
                Export Current Data
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Exports current page data to clipboard as JSON
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}