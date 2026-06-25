# Legacy page shell wrapper removal

The shared `frontend/app/(workspace)/layout.tsx` is the sole owner of `AuthGate` and `AppShell`.

Removed compatibility wrappers from 16 route implementation files:

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

The `shell:audit` check prevents page-level shell imports or JSX wrappers from returning.
