import { mutation } from "./_generated/server";

export const backfillLayerMeta = mutation({
  args: {},
  handler: async (ctx) => {
    const pageContentDocs = await ctx.db.query("pageContent").collect();
    
    let updatedCount = 0;
    
    for (const doc of pageContentDocs) {
      let needsUpdate = false;
      const updatedSections = doc.sections.map((section: any, sectionIndex: number) => {
        let sectionNeedsUpdate = false;
        
        const updatedSection = { ...section };
        
        if (section.visible === undefined) {
          updatedSection.visible = true;
          sectionNeedsUpdate = true;
        }
        
        if (section.locked === undefined) {
          updatedSection.locked = false;
          sectionNeedsUpdate = true;
        }
        
        if (section.collapsed === undefined) {
          updatedSection.collapsed = false;
          sectionNeedsUpdate = true;
        }
        
        if (!section.name) {
          updatedSection.name = `Section ${sectionIndex + 1}`;
          sectionNeedsUpdate = true;
        }
        
        const updatedWidgets = section.widgets.map((widget: any, widgetIndex: number) => {
          let widgetNeedsUpdate = false;
          const updatedWidget = { ...widget };
          
          if (!widget.id) {
            updatedWidget.id = `widget-${Date.now()}-${widgetIndex}`;
            widgetNeedsUpdate = true;
          }
          
          if (widget.visible === undefined) {
            updatedWidget.visible = true;
            widgetNeedsUpdate = true;
          }
          
          if (widget.locked === undefined) {
            updatedWidget.locked = false;
            widgetNeedsUpdate = true;
          }
          
          if (!widget.name) {
            const typeName = widget.type.charAt(0).toUpperCase() + widget.type.slice(1);
            updatedWidget.name = `${typeName} Widget`;
            widgetNeedsUpdate = true;
          }
          
          if (widgetNeedsUpdate) {
            sectionNeedsUpdate = true;
          }
          
          return updatedWidget;
        });
        
        if (sectionNeedsUpdate) {
          updatedSection.widgets = updatedWidgets;
          needsUpdate = true;
        }
        
        return updatedSection;
      });
      
      if (needsUpdate) {
        await ctx.db.patch(doc._id, { sections: updatedSections });
        updatedCount++;
        console.log(`Updated page: ${doc.pageId}`);
      }
    }
    
    console.log(`Backfill completed! Updated ${updatedCount} of ${pageContentDocs.length} pages.`);
    
    return {
      totalPages: pageContentDocs.length,
      updatedPages: updatedCount,
      message: `Backfill completed! Updated ${updatedCount} of ${pageContentDocs.length} pages.`
    };
  },
});
