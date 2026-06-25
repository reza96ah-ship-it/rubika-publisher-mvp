# Legacy page shell wrapper removal

The shared `frontend/app/(workspace)/layout.tsx` is the sole owner of `AuthGate` and `AppShell`.

Compatibility wrappers were removed from 16 route implementation files:

- `frontend/app/_workspace-page.tsx`
- `frontend/app/analytics/_page.tsx`
- `frontend/app/calendar/_page.tsx`
- `frontend/app/campaigns/_page.tsx`
- `frontend/app/channels/_page.tsx`
- `frontend/app/compose/_page.tsx`
- `frontend/app/content/_page.tsx`
- `frontend/app/design-system/_page.tsx`
- `frontend/app/inbox/_page.tsx`
- `frontend/app/instagram/_page.tsx`
- `frontend/app/logs/_page.tsx`
- `frontend/app/media/_page.tsx`
- `frontend/app/onboarding/_page.tsx`
- `frontend/app/queue/_page.tsx`
- `frontend/app/rubika/_page.tsx`
- `frontend/app/store/_page.tsx`

The route-group layout keeps public URLs unchanged while centralizing authentication, notification polling, command-palette shortcuts, mobile haptics, and workspace scrolling.

The `shell:audit` command rejects any future protected page that imports or renders `AuthGate` or `AppShell` outside the shared workspace layout.
