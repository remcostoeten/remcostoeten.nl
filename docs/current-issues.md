# Current Issues Documentation

This document captures the current test failures and build warnings as of the project reproduction step.

## Test Issues (bun run test)

### Vitest Failures Summary
- **Total Tests**: 35 tests
- **Failed**: 2 tests (both admin-variant related)  
- **Passed**: 33 tests
- **Test File**: `src/components/ui/ButtonLink.test.tsx`

### Failed Tests Details

#### 1. Admin Variant Classes Test
**Test**: `ButtonLink > Variant class generation > applies admin variant classes`
**Error**: 
```
expect(element).toHaveClass("bg-background border-2 border-border hover:border-accent/50 text-foreground focus:ring-accent")

Expected the element to have class:
  bg-background border-2 border-border hover:border-accent/50 text-foreground focus:ring-accent
Received:
  inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed undefined h-10 px-4
```

#### 2. Default Admin Variant Test
**Test**: `ButtonLink > Variant class generation > applies default admin variant when no variant specified`
**Error**:
```
expect(element).toHaveClass("bg-background border-2 border-border hover:border-accent/50 text-foreground hover:-translate-y-0.5 focus:ring-accent")

Expected the element to have class:
  bg-background border-2 border-border hover:border-accent/50 text-foreground hover:-translate-y-0.5 focus:ring-accent
Received:
  inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-accent text-accent-foreground hover:bg-accent/90 focus:ring-accent h-10 px-4
```

### Additional Test Errors
- **JSDOM Navigation Error**: Multiple instances of "Error: Not implemented: navigation (except hash changes)" affecting ButtonLink tests
- Test exit code: 1 (indicating failure)

## Build Issues (bun run build)

### Build Success
- Build completed successfully with exit code 0
- All routers built successfully (ssr, client, server-fns)

### Vinxi Warning
**Warning**: `"default" is not exported by "src/entry-client.tsx", imported by "virtual:$vinxi/handler/client"`

Location: `virtual:$vinxi/handler/client (1:104)`

### Build Output Summary
- **SSR Router**: ✓ Built successfully (39.15 kB main bundle)
- **Client Router**: ✓ Built successfully with warning (31.59 kB main bundle)  
- **Server-fns Router**: ✓ Built successfully (19.84 kB main bundle)
- **Nitro Server**: ✓ Built successfully

## Analysis

### Test Issues
The admin variant functionality appears to be missing or incorrectly implemented in the ButtonLink component. The tests expect specific CSS classes for the admin variant, but the component is either:
1. Not applying the admin variant classes at all (returning `undefined` in some cases)
2. Falling back to different variant classes instead of the expected admin styles

### Build Warning
The entry-client.tsx file is missing a default export that Vinxi expects for the client-side hydration. This could affect client-side functionality.

## Next Steps
1. Fix the admin variant implementation in ButtonLink component
2. Add proper default export to src/entry-client.tsx
3. Re-run tests to verify fixes
