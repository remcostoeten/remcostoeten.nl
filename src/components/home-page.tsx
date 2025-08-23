import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { Widget } from "./widget";

export function HomePage() {
  const siteConfig = useQuery(api.site.getSiteConfig);
  const pageContent = useQuery(api.site.getPageContent, { pageId: "home" });

  useEffect(() => {
    if (siteConfig?.title) {
      document.title = siteConfig.title;
    }
    if (siteConfig?.metaDescription) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', siteConfig.metaDescription);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = siteConfig.metaDescription;
        document.head.appendChild(meta);
      }
    }
    if (siteConfig?.favicon) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (link) {
        link.href = siteConfig.favicon;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = siteConfig.favicon;
        document.head.appendChild(newLink);
      }
    }
  }, [siteConfig]);

  if (!pageContent) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="runtime-container px-4">
        {pageContent.sections.map((section) => (
          <div
            key={section.id}
            className={`flex ${section.direction} ${section.justify} ${section.align} ${section.gap} ${section.padding} ${section.margin || ''}`}
            style={{ maxWidth: 'var(--container-max-width)', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}
          >
            {section.widgets.map((widget, index) => (
              <Widget
                key={`${section.id}-${index}`}
                type={widget.type}
                props={widget.props}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
