/**
 * Rehype plugin to parse height props from code fences
 * Supports syntax like:
 * ```tsx 400px
 * ```tsx max=400px
 * ```typescript 300
 */

export function rehypeCodeHeight() {
  return (tree) => {
    // Walk through the tree to find pre > code elements
    function visit(node) {
      if (node.type === 'element' && node.tagName === 'pre') {
        // Check if this pre element has code as its first child
        if (node.children && node.children.length > 0) {
          const codeElement = node.children[0];

          if (codeElement.type === 'element' && codeElement.tagName === 'code') {
            // Look for data attributes or parse from className
            const className = codeElement.properties?.className || [];
            const languageClass = className.find(cls => cls.startsWith('language-'));

            if (languageClass) {
              const language = languageClass.replace('language-', '');

              // Check for height specification in the language string
              // Format: language-height or language max=height
              const heightMatch = language.match(/^(.+?)(?:-(\d+)(px)?| max=(\d+)(px)?)$/);

              if (heightMatch) {
                const [, actualLanguage, height1, unit1, height2, unit2] = heightMatch;
                const height = height1 || height2;
                const unit = unit1 || unit2 || 'px';

                // Update the className to remove the height specification
                codeElement.properties.className = className.map(cls => {
                  if (cls === languageClass) {
                    return `language-${actualLanguage}`;
                  }
                  return cls;
                });

                // Add the maxHeight data attribute to the pre element
                if (!node.properties) node.properties = {};
                node.properties['data-max-height'] = `${height}${unit}`;

                // Also add it to the code element for consistency
                if (!codeElement.properties) codeElement.properties = {};
                codeElement.properties['data-max-height'] = `${height}${unit}`;
              }
            }
          }
        }
      }

      // Continue visiting child nodes
      if (node.children) {
        node.children.forEach(visit);
      }
    }

    visit(tree);
  };
}
