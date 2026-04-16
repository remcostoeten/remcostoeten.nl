---
title: "What I've been shipping lately"
publishedAt: '10-16-2026'
updatedAt: '10-16-2026'
summary: 'A lightweight running log of what I have been building, what shipped, what changed, and what I am paying attention to next.'
tags: ['Personal', 'Build Log', 'Shipping']
topic: 'Personal'
author: 'Remco Stoeten'
slug: 'what-ive-been-shipping-lately'
draft: false
---

Lately I have been trying to ship smaller things more often instead of waiting until a project feels "finished." This post is a simple running note: what went out, what changed behind the scenes, what is still rough, and what I want to improve next.

It is less of a polished launch post and more of a snapshot. A place to document momentum while the work is still fresh.

## What shipped

- **[ @remcostoeten/analytics ]**  
  There was no real reason for this, besides me wanting to roll my own service and learn some more back-end. It's a privacy-first, event-sourced analytics engine built on **Bun**, **Hono** (Vercel Edge), and **Neon/Postgres**. It leverages JSONB for a schema-less event stream that supports advanced forensics (Browser/OS parsing) out of the box.
  
  - **Possibilities**: Track Web Vitals (LCP, CLS, INP), E-commerce revenue, A/B test variants, and full user funnels without migrations.
  - **Usage**:
    ```tsx
    import { Analytics, trackEvent, useAnalytics } from '@remcostoeten/analytics';

    // 1. Initialize globally with robust user segmentation
    export default function RootLayout({ children }) {
      return (
        <Analytics 
          ingestUrl="https://ingest.remcostoeten.nl"
          options={{ 
            trackWebVitals: { lcp: true, fid: true, cls: true },
            sessionReplay: 'sampled', // Record 10% of sessions for performance
            anonymizeIp: true 
          }} 
        >
          {children}
        </Analytics>
      );
    }

    // 2. Rich e-commerce tracking integrated into feature components
    function CheckoutButton({ cart }) {
      const { identify, track } = useAnalytics();

      const handleCheckout = () => {
        // Tie subsequent events to a specific user identity securely
        identify('USR_8921', { trait: 'premium_tier', LTV: 450 });

        // Fire a complex schema-less event with full type-safety payload
        track('checkout_initiated', { 
          cartValue: cart.total, 
          currency: 'EUR',
          items: cart.items.map(i => i.sku),
          appliedDiscount: 'SUMMER_SALES_26',
          abTestVariant: 'checkout_v2_red_btn'
        });
      };

      return <button onClick={handleCheckout}>Checkout</button>;
    }
    ```
  - **GitHub**: [remcostoeten/analytics](https://github.com/remcostoeten/analytics)
  - **Live Demo**: [analytics.remcostoeten.nl](https://analytics.remcostoeten.nl)

- **[ @remcostoeten/use-shortcut ]**  
  I built this because existing shortcut libraries felt clunky. I wanted a "human-readable" API that felt like writing a sentence, with perfect TypeScript autocompletion for every key and modifier. 

  - **Tech Talk**: A zero-dependency React hook built with a fluent/chainable builder pattern. It handles event listener cleanup automatically and supports advanced modifier combinations without manual string parsing.
  - **Possibilities**: Support for command combos (Ctrl/Cmd + K), sequential key presses (G then H), global/scoped listeners, and automatic documentation generation via description tags.
  - **Usage**:
    ````tsx
    import { useShortcut, ScopeProvider } from '@remcostoeten/use-shortcut';

    function AdvancedCommandPalette() {
      const searchRef = useRef<HTMLInputElement>(null);

      // Builder pattern enables complex sequencing and scope locking
      useShortcut()
        .sequence('g', 't') // Wait for 'g' THEN 't' (Go To)
        .or()
        .cmd().shift().key('p') // Or use standard modifier combo
        .scope(searchRef) // Only trigger if this element doesn't have focus
        .preventDefault()
        .debounce(150) // Prevent rapid firing bounds
        .action((event, meta) => {
          console.log(`Triggered via: ${meta.triggerType}`);
          searchRef.current?.focus();
        })
        .description('Navigate to specific project view')
        .build();

      return <input ref={searchRef} placeholder="Search..." />;
    }
    ````
  - **GitHub**: [remcostoeten/use-shortcut](https://github.com/remcostoeten/use-shortcut)
  - **Live Demo**: [use-shortcut.vercel.app](https://use-shortcut.vercel.app)

- **[ oauth-app-automator ]**  
  I hate creating OAuth applications when using social providers. Thus I automated the process with a Python program. Authenticate once and from there you're able to create, (bulk) delete apps and test credentials. Write secret and client ID to clipboard, or straight in your environment variable.

  - **Tech Talk**: Python-based automation that scripts the actual browser interactions (via Selenium/Playwright) to fetch credentials directly from provider portals (GitHub/Google).
  - **Possibilities**: Bulk creation of developer apps, automatic `.env` file updates, and a clean interactive CLI/TUI for managing credentials.
  - **GitHub**: [remcostoeten/oauth-app-automator](https://github.com/remcostoeten/oauth-app-automator)

- **[ Kuizer ]**  
  Maintaining large TypeScript projects often leads to "dead code rot." I needed a fast, reliable way to prune the tree without manual auditing—so I built Kuizer to handle the heavy lifting.

  - **Tech Talk**: A high-performance CLI built with **Bun**. It analyzes the TypeScript import graph to detect unreachable files and unused exports by deep-diving into the AST.
  - **Possibilities**: Browse findings in an interactive terminal UI (TUI), categorize unused exports (types vs components), and safe snapshot-based rollbacks for every automated fix.
  - **Usage**:
    ````bash
    # Run a deep AST dependency graph analysis to find dead code
    # -i: Interactive TUI mode for reviewing findings
    # --fix: Automatically treeshake and safely remove unused code
    # --snapshot: Create a rollback snapshot before mutating files
    # --exclude: Glob array pattern for files to ignore during analysis
    kuizer analyze \
      --interactive \
      --fix \
      --snapshot ./.kuizer-backups/ \
      --exclude "**/*.test.ts" "src/legacy-api/**" \
      --threshold "medium"
    ````
  - **GitHub**: [remcostoeten/kuizer](https://github.com/remcostoeten/kuizer)

