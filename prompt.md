# Prompt for Design Agent

**Role:** Expert UI Engineer & Designer
**Task:** Create a new "Snippet Store Module" & Redesign the existing Playground.
**Context:** Personal Portfolio Website
**Placement:** Render this new section either immediately **above** or **below** the "Featured Projects" section on the homepage.

---

### 1. Scope & Purpose

This is a **personal portfolio website**.
The goal of this new "Sandbox/Playground" feature is to serve as a **showcase for technical explorations** that don't fit into full "Projects".

**What we are storing/displaying:**

- **Snippets:** Reusable code patterns, hooks, or quick utilities.
- **UI Experiments:** Animation trials, component prototypes, or visual designs.
- **Packages/CLI Tools:** Small libraries or scripts.

Think of it as a "Digital Garden" or "Store" where visitors can browse these smaller artifacts. It needs to feel like a premium, curated collection.

### 2. Functional Requirements

- **Detail View:** Users must be able to click on any item (snippet, experiment, etc.) to open a **detailed view** (modal or separate page) to see the code, live preview, and description.
- **Visuals:** High-quality, "wow" factor design.
- **Location:** Integrate this seamlessly on the homepage, keeping the "Featured Projects" section in mind (place it above or below it).

### 3. Critical Constraint: Animation Physics

**Do not reinvent the interaction physics.**
You must **strictly preserve the exact sorting, filtering, and layout animation physics** of existing playground. The feel of switching tabs and reordering items must remain identical to the current implementation.

**Use these exact Framer Motion configurations:**

1. **Easing Curve:**

    ```typescript
    const bezier = [0.16, 1, 0.3, 1] as const // Smooth elastic-like bezier
    ```

2. **Card Animations (Entry/Exit/Layout):**
    - Apply `layout` prop to the container and items for smooth reordering.
    - Use `AnimatePresence` with `mode="popLayout"`.

    ```tsx
    <motion.button
        layout
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        exit={{ y: 20, scale: 0.95 }}
        transition={{
            duration: 0.4,
            ease: bezier
        }}
        // ... styling
    >
    ```

3. **Filter Tab Animation:**
    - Use `layoutId` for the active tab indicator.
    ```tsx
    <motion.div
    	layoutId="playgroundFilter"
    	transition={{ type: 'spring', stiffness: 500, damping: 35 }}
    	// ... styling
    />
    ```

### 4. Technical Constraints

- **Stack:** React, Tailwind CSS, Framer Motion.
- **Reference Code:** See `src/app/(marketing)/playground/content.tsx` for the current logic and data structure. Ensure feature parity (filtering, selection).
