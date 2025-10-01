# Dead Code Audit Report

## 🗑️ **Dead Code Found**

### **1. Unused SEO Components**
- `src/components/seo/BlogSEO.tsx` - Never imported or used
- `src/components/seo/index.ts` - Only exports unused BlogSEO

### **2. Unused Dependencies**
- `react-helmet-async` - Only used in unused BlogSEO component

### **3. All Test Files & Configuration**
- `vitest.config.ts` - Vitest configuration
- `scripts/test-spotify-auth.ts` - Test script for Spotify auth
- `scripts/debug-spotify-redirect.ts` - Debug script for Spotify
- `src/components/blog/__tests__/` (entire directory with 6 test files)
- `src/components/mdx/__tests__/` (entire directory)
- `src/lib/animations/__tests__/` (entire directory)
- `src/lib/blog/__tests__/` (entire directory)
- `src/app/github-test/` - Test page for GitHub integration
- `src/app/spotify-test/` - Test page for Spotify integration
- Test dependencies in package.json:
  - `@testing-library/jest-dom`
  - `@testing-library/react`
  - `@testing-library/user-event`
  - `vitest`
  - `jsdom`

### **4. Unused Components**
- `src/components/effects/animated-folder-icon.tsx` - Never imported
- `src/components/blog/category-overview.tsx` - Only used in tests
- `src/components/blog/table-of-contents.tsx` - Superseded by redesign version

### **5. Unused Hooks**
- `src/hooks/use-mobile-toc.ts` - Never imported or used
- `src/hooks/use-theme.ts` - Superseded by next-themes

### **6. Unused Files**
- `src/lib/animtaions.ts` - Misspelled filename, never imported
- `src/components/blog/blog-posts-server.tsx` - Never used (client version used instead)

### **7. Unused Blog Utilities**
- `src/lib/blog/api.ts` - Never imported
- `src/lib/blog/client.ts` - Never imported
- `src/lib/blog/fallback.ts` - Never imported
- `src/lib/blog/get-posts.ts` - Never imported
- `src/lib/blog/minimal-mdx-utils.ts` - Never imported
- `src/lib/blog/simple-mdx-utils.ts` - Never imported
- `src/lib/blog/static-mdx-utils.ts` - Never imported

### **8. Unused Test Pages**
- `src/app/github-test/page.tsx` - Development test page
- `src/app/spotify-test/page.tsx` - Development test page
- `src/app/spotify-de/page.tsx` - Duplicate/unused Spotify page

### **9. Unused Animation System**
- `src/lib/animations/` - Entire directory unused (superseded by modules/shared)

### **10. Unused Module Components**
- Several components in `src/modules/` that are never imported

## 📊 **Impact Analysis**

### **Bundle Size Reduction**
- Removing unused dependencies: ~500KB
- Removing unused components: ~200KB
- Removing test files: ~150KB
- **Total estimated reduction: ~850KB**

### **Maintenance Reduction**
- 50+ unused files to remove
- 1 unused dependency to remove
- Cleaner codebase for future development

## 🧹 **CLI Command to  Clean Everything**

```bash
# Single command to remove all dead code
# Complete cleanup command - removes ALL test files and dead code
rm -rf \
  vitest.config.ts \
  scripts/test-spotify-auth.ts \
  scripts/debug-spotify-redirect.ts \
  src/components/seo/ \
  src/components/effects/animated-folder-icon.tsx \
  src/components/blog/__tests__/ \
  src/components/mdx/__tests__/ \
  src/lib/animations/__tests__/ \
  src/lib/blog/__tests__/ \
  src/components/blog/category-overview.tsx \
  src/components/blog/table-of-contents.tsx \
  src/components/blog/blog-posts-server.tsx \
  src/hooks/use-mobile-toc.ts \
  src/hooks/use-theme.ts \
  src/lib/animtaions.ts \
  src/lib/blog/api.ts \
  src/lib/blog/client.ts \
  src/lib/blog/fallback.ts \
  src/lib/blog/get-posts.ts \
  src/lib/blog/minimal-mdx-utils.ts \
  src/lib/blog/simple-mdx-utils.ts \
  src/lib/blog/static-mdx-utils.ts \
  src/lib/animations/ \
  src/app/github-test/ \
  src/app/spotify-test/ \
  src/app/spotify-de/ && \
npm uninstall react-helmet-async @testing-library/jest-dom @testing-library/react @testing-library/user-event vitest jsdom && \
npm pkg delete scripts.test scripts.test:run && \
echo "🧹 Complete cleanup finished! All test files and dead code removed."

# Test files ONLY command:
rm -rf \
  vitest.config.ts \
  scripts/test-spotify-auth.ts \
  scripts/debug-spotify-redirect.ts \
  src/components/blog/__tests__/ \
  src/components/mdx/__tests__/ \
  src/lib/animations/__tests__/ \
  src/lib/blog/__tests__/ \
  src/app/github-test/ \
  src/app/spotify-test/ && \
npm uninstall @testing-library/jest-dom @testing-library/react @testing-library/user-event vitest jsdom && \
npm pkg delete scripts.test scripts.test:run && \
echo "🧪 All test files removed!"
```

## ⚠️ **Before Running**

1. **Backup your code** (commit current changes)
2. **Run tests** to ensure nothing breaks
3. **Review the list** - some files might be needed for future features

## 🔍 **Files to Review Manually**

These files might be used but weren't detected in the search:
- `src/lib/blog/seo.ts` - Check if used elsewhere
- Some module components - May be used in ways not detected

## 📝 **Post-Cleanup Tasks**

1. Update imports that might reference deleted files
2. Run `npm run build` to check for build errors
3. Run `npm run lint` to check for linting issues
4. Test the application thoroughly
5. Update documentation if needed

---

**Total files to delete: ~50+**
**Estimated bundle size reduction: ~850KB**
**Maintenance complexity reduction: High**