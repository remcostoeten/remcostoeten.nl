'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
}

export function ContactButton({ children, className }: Props) {
  const handleClick = () => {
    const email = process.env.NEXT_PUBLIC_EMAIL
    const subject = 'Remcostoeten.nl - Footer contact submission';
    const body = 'Hi Remco,\n\nI found your portfolio and wanted to reach out about...\n\nBest regards';

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <button
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
};


## Prompt: Build a Reusable, Self Hosted Analytics System for Next.js Inspired by Vercel Analytics

You are building a ** reusable analytics system ** inspired by`@vercel/analytics`, designed to be:

- Installable as an ** npm package **
  - Reusable across ** multiple projects **
    - Privacy conscious
      - Fully self hosted
        - Compatible with modern Next.js architecture

The system must support ** centralized analytics storage **, ** local project storage **, or ** both **, depending on configuration.

---

## High Level Goal

Enable analytics in any Next.js project by rendering a single component:

```
<Analytics />
```

With optional configuration for storage strategy.

---

## Design Philosophy

  - Match Vercel Analytics semantics and behavior
    - Lightweight and fast
      - Zero config by default
- No cookies
  - Anonymous analytics
    - No cross site tracking
      - Aggregated data only
        - Explicit and transparent tradeoffs

This is ** product analytics **, not user surveillance.

---

## Architecture Overview

The system is split into ** three layers **:

1. ** analytics - core **
  Reusable npm package, client instrumentation only

2. ** storage adapters **
  Decide where analytics are written

3. ** analytics ingestion service **
  Optional centralized backend with its own database

---

## Layer 1: analytics - core(npm package)

This is the only package imported by applications.

  Responsibilities:

- `<Analytics />` React component
  - Client side event collection
    - Page view and navigation tracking
      - Fingerprint generation(privacy aware)
        - Event batching and deduplication
          - Transport abstraction

Rules:

- No database connections
  - No infrastructure assumptions
    - Safe to import anywhere
- Tree shakeable
  - Minimal client bundle

Example usage:

```
import { Analytics } from "@your-org/analytics"
```

---

## Analytics Component API

Default usage, centralized analytics:

```
<Analytics
  mode="remote"
  endpoint="https://analytics.example.com/ingest"
  projectId="skriuw-web"
/>
```

Local project database usage:

```
<Analytics
  mode="local"
  provider="turso"
  db={db}
  schema={analyticsSchema}
/>
```

Hybrid mode, both local and central storage:

```
<Analytics
  mode="hybrid"
  local={{
    provider: "turso",
    db,
    schema: analyticsSchema
  }}
  remote={{
    endpoint: "https://analytics.example.com/ingest",
    projectId: "skriuw-web"
  }}
/>
```

---

## Framework and Runtime Requirements

  - Next.js 15 +
    - React 19 +
      - App Router only
        - Server Actions only
          - No API routes
            - Fully compatible with SSR and streaming
              - Edge and Node compatible

---

## Visitor Identification and Uniqueness

The system must support ** unique visitor counting ** using a ** privacy aware fingerprint strategy **, inspired by Vercel Analytics.

### Fingerprint Rules

  - No cookies
    - No raw IP storage
      - No persistent user identity
        - No cross project tracking
          - No fingerprinting libraries

### Fingerprint Strategy

  - Generate a ** server side hash **
    - Hash input may include:
- IP address(hashed immediately, never stored)
  - User agent
    - Accept headers
      - Platform geo headers
        - The resulting fingerprint:
- Is opaque
  - Is non reversible
    - Is rotated periodically
      - Is scoped per project

Used only for aggregation and unique visitor estimation.

---

## Client Side Storage

Limited client storage is allowed.

  Purpose:

- Navigation deduplication
  - Visit grouping

Rules:

- Use localStorage
  - Store a short lived opaque visit id
    - Regenerate when cleared
      - Never personally identifying

Example key:

```
__analytics_visit_id
```

---

## Collected Client Data

Allowed fields:

- pathname
  - referrer
  - screen size bucket
    - timezone
    - language
    - navigation type
      - visit id

No cookies, no PII.

---

## Geo Information

Geo enrichment must happen ** server side only **.

  Sources:

- Platform headers(Vercel, Cloudflare, Fly)
  - IP based geo lookup as fallback

Rules:

- Never store raw IPs
  - Geo must be coarse
    - Allowed fields:
- country
  - region
  - city(optional)

---

## Event Transport

  - Use`navigator.sendBeacon` by default
- Fallback to `fetch` with `keepalive`
- Batched payloads
  - Fired on:
- initial page load
  - route change
    - visibility change

Never block rendering or navigation.

---

## Storage Adapters

### Local Adapter

  - Uses Server Actions
    - Writes directly to the host project database
      - Uses Drizzle ORM
        - Database connection provided by the host app

### Remote Adapter

  - Sends events to a centralized ingestion service
    - No database access from the app
      - Best effort delivery

---

## Central Analytics Ingestion Service

This is a ** separate deployed application **.

  Responsibilities:

- Owns its own database
  - Uses Drizzle ORM
    - Handles ingestion, validation, enrichment
      - Stores analytics for multiple projects
        - Uses a shared database(eg Neon PostgreSQL)

### Multi Project Support

  - All records are scoped by`project_id`
    - Optional`environment` field
      - Indexes per project
        - Aggregation queries scoped by project

---

## Database and Schema Requirements

  - Portable between PostgreSQL and SQLite
    - No PII
      - No IP storage
        - Append only
          - Timestamp based
            - Optimized for aggregation

Tables may include:

  - page_views
    - visits
    - aggregated_counters

---

## Folder Structure

Module based and scalable:

```
packages/
  analytics-core
  analytics-adapters
apps/
  analytics-service
```

---

## Performance Constraints

  - Client payload under 2kb gzipped
    - No hydration cost
      - No blocking JavaScript
        - Zero layout shift
          - Minimal runtime dependencies

---

## Non Goals

  - No dashboards
    - No heatmaps
      - No session replay
        - No authentication
          - No cookies
            - No user profiling

Analytics collection only.

---

## Deliverables

  - analytics - core npm package
    - Local and remote storage adapters
      - Central ingestion service
        - Drizzle schemas
          - Server actions
            - Example usage:
- centralized analytics with Neon
- local project analytics
  - hybrid mode
    - README explaining:
- privacy model
  - fingerprinting tradeoffs
    - storage modes

---

  The final result should feel like a ** reusable, self hosted alternative to @vercel/analytics**, suitable for powering analytics across multiple projects with clear ownership and modern Next.js architecture.
