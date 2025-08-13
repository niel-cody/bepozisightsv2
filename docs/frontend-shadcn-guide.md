### Frontend guide: shadcn/ui usage in this app

This document explains how we implement shadcn/ui patterns so every new screen stays consistent, accessible, and themable.

Design tokens
- Use tokens, not raw scales.
  - Colors: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border`, `bg-accent`, `text-accent-foreground`, `bg-primary`, etc.
  - Borders: `border` (maps to `--border`).
  - Radii: default `rounded-md`. Change only with intent. Global radius in `--radius`.
  - Charts: `var(--chart-1..5)`.

Theme configuration
- Tailwind: `tailwind.config.ts` extends shadcn tokens and animations.
- CSS variables: `client/src/index.css` defines `:root` and `.light`. Keep names aligned with tailwind keys.
- Dark mode: class strategy (`darkMode: ["class"]`).

Layout patterns
- App root uses `SidebarProvider` and `SidebarInset`.
- Header sizing is responsive via CSS var:
  - Set on the root: `[--header-height:theme(spacing.12)] md:[--header-height:theme(spacing.14)] lg:[--header-height:theme(spacing.16)]`.
  - Header: `h-[--header-height] sticky top-0 backdrop-blur bg-background/80 supports-[backdrop-filter]:bg-background/60`.
- Content paddings: prefer `p-3 md:p-4 lg:p-6`.
- Ensure `min-h-svh` on main content (already applied by `SidebarInset`).

Sidebar usage
- Use `@/components/ui/sidebar` primitives only:
  - `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`.
  - `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`.
  - For subsections, use `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`.
  - Collapsible icon variant: `collapsible="icon"`.
  - Mobile opens as `Sheet` automatically via the component.
- Sections for this app:
  - Header: org switcher (dropdown if >1 org; fixed label if 1).
  - Main: AI Chat parent.
  - Group: Insights (Sales, Products, Operators, Accounts) using `SidebarMenuSub*`.
  - Third section: Settings.
  - Footer: user menu with Logout.

Components
- Prefer shadcn scaffolds: `npx shadcn@latest add <component>`.
- Alerts: `@/components/ui/alert` with `variant="default|destructive"`.
- Buttons: `@/components/ui/button` variants (`default`, `outline`, `secondary`, `ghost`, `link`) and sizes.
- Forms: use shadcn Form, Input, Label, Textarea, Select, etc.
- Dialogs/Sheets/Dropdowns: always via shadcn wrappers to ensure accessibility.

Charts
- Use `var(--chart-1..5)` for colors. No hardcoded HSL/hex in components.
- Extend tokens if you need more series.

Do/don't examples
- Do: `className="rounded-md border bg-card text-card-foreground"`.
- Don’t: `className="rounded-2xl border border-gray-200 bg-white text-gray-900"`.
- Do: `hover:bg-accent hover:text-accent-foreground`.
- Don’t: `hover:bg-blue-50 hover:text-blue-700`.

Accessibility and keyboard
- Keep `focus-visible:ring-2 ring-ring ring-offset-2` via shadcn defaults.
- Provide `sr-only` labels for icon-only buttons.
- Test tab order and sidebar submenu keyboard interactions.

PR checklist (blocker)
- No raw Tailwind color scales in changed files.
- No ad-hoc component copies; use `@/components/ui/*`.
- Header uses responsive var (no fixed `h-16`).
- Sidebar sub-nav uses `SidebarMenuSub*`.
- New charts pull from `var(--chart-*)`.
- Lint passes; story/test or minimal preview included if component behavior changes.

How to add a new screen
1) Create the route component.
2) Add a menu item (or sub-item) in `app-sidebar.tsx` using the primitives.
3) Build UI with shadcn components and tokens only.
4) Verify mobile (≤768px), tablet (≥768px), desktop (≥1024px).
5) Submit PR with the checklist.


