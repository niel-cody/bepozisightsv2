### Shadcn/ui action plan (implementation + cleanup)

Objective
- Align our UI/UX fully with shadcn/ui patterns for consistency, accessibility, and responsiveness across desktop, tablet, and mobile.

High‑impact tasks (1–2 days)
1) Layout variables and header density
   - Add responsive variables on the layout root (per shadcn blocks):
     - `--sidebar-width`, `--sidebar-width-mobile`, `--sidebar-width-icon` (already set in `ui/sidebar`).
     - `--header-height` via `SidebarProvider` style or utility classes.
   - Use `h-[--header-height]` on the header; sticky with `backdrop-blur` and reduced mobile padding.

2) Sidebar structure per shadcn blocks
   - Keep org switcher in `SidebarHeader` (dropdown when multiple; fixed label when single).
   - Main: AI Chat (parent).
   - Group: Insights (`SidebarMenuSub` items for Sales, Products, Operators, Accounts).
   - Section: Settings.
   - Footer: User with dropdown → Logout.
   - Ensure `collapsible="icon"` behavior works on mobile via `Sheet`.

3) Token audit and class hygiene
   - Use shadcn tokens only: `bg-card`, `text-muted-foreground`, `border`, `bg-accent`, etc.
   - Remove raw Tailwind color scales (`text-gray-500`, `bg-blue-50`, etc.).
   - Default radii to `rounded-md`; only opt up with intent.
   - Confirm `:root` and `.light` palettes match `tailwind.config.ts` names.

4) Chart theming
   - Already updated to `var(--chart-1)` tokens. Keep all chart colors from CSS vars.
   - Optional: Add `--chart-6`..`--chart-10` if needed.

5) Component usage consistency
   - Always import from `@/components/ui/*` for primitives.
   - Prefer shadcn components for alerts, dialogs, dropdowns, forms, etc.
   - Avoid custom one‑offs unless required; if added, keep the API aligned with shadcn.

6) Remove/deprecate legacy/duplicate code
   - Duplicate hook removed: `use-mobile.tsx`. Keep `use-mobile.ts` only.
   - Consider deleting `client/src/components/dashboard/sidebar.tsx` (legacy) to avoid confusion.

7) Accessibility + keyboard support
   - Verify focus rings, `sr-only` text, and keyboard navigation especially in the sidebar sub‑menus.
   - Ensure `TooltipProvider` wraps the app (already done).

Process and guardrails
- Add a PR checklist (see README) to block non‑token colors and non‑shadcn patterns.
- For new components, use `npx shadcn@latest add <component>` to scaffold canonical code before customizing.

Milestones
1) Day 1: Layout/header variables; sidebar refactor verified on mobile and tablet; delete legacy sidebar.
2) Day 2: Token pass across screens; accessible states; docs/readme adoption; merge.

Acceptance criteria
- Header height is responsive (≈48/56/64 px). No clipping or overflow on iOS/Android.
- Sidebar collapses, submenus work via `SidebarMenuSub*` and are keyboard accessible.
- No raw Tailwind color scales in app code; only tokens.
- Charts and feedback components (alerts/toasts) use tokens.
- PR checklist passes.


