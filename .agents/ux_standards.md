# UX standards

## Six states per screen
Loading, Skeleton, Success (toast), Error (`error.tsx` / EmptyState + retry), No permission, Offline
(`OfflineBanner`; submit buttons disable via `useOnline`).
Implemented: skeleton (`loading.tsx`), error (`error.tsx`), not-found, offline, empty states.
No-permission screen lands with the admin dashboard (phase 3).

## Input Validation Rules
Rules live in `src/lib/validation.ts` (Zod). Validate on blur, then on change.

| Type | Rule |
|---|---|
| Email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Text/name | not an email, not a pure number |
| Number | digits, `.`, optional `-` only |
| Phone | `/^[+\d\s\-()\[\]]{7,15}$/` |
| URL | `z.string().url()` |
| Password | >= 8 chars, 1 uppercase, 1 digit, 1 symbol; show strength meter |
| Textarea | max 500, live `X / 500`, amber at 450, red at 500 |

Form checklist: red `*` after label + `aria-required`; inline error below the field (icon + red text) shown only after
the field is touched; submit `disabled` until valid and not submitting; Enter submits; backend errors surface as
`toast.error`, never inline.

## Typography & Touch Targets
- **Minimum Input Font Size (Strict):** Every `<input>`, `<textarea>`, and `<select>` MUST have `font-size: 16px` minimum (`text-base` / `text-[16px]`). Prevents iOS Safari and mobile Chrome from automatically zooming in and skewing responsive layouts.
- **Minimum Touch Targets:** Interactive buttons, tabs, and filter pills must be >= 40px height (`h-10` or `h-11`) with adequate tap padding on mobile.
- **Theme Defaults:** Light mode is default; dark mode switches on explicit toggle and persists via `next-themes` and `localStorage`.
