# BlockSubmit frontend dashboard

## Goal
Build a frontend-only, responsive BlockSubmit application with distinct professor and student experiences. Keep all demo behavior behind a replaceable mock service so the later Express API integration does not require redesigning screens.

## What will be built

### Foundation
- Create a premium dark academic-security design system with restrained cyan, violet, teal, amber, and red status accents.
- Add typed domain models for users, assignments, submissions, blockchain proof, verification results, dashboard statistics, and activity.
- Add one configuration switch for mock versus real API mode.
- Build centralized request handling, token persistence, normalized errors, unauthorized-session handling, and service modules for auth, dashboards, assignments, submissions, verification, and activity.
- Keep all realistic demo records and simulated delays/progress inside the mock adapter only.

### Shared application experience
- Responsive desktop sidebar, mobile drawer, top header, search/notifications/profile controls, role-aware navigation, logout, loading skeletons, and useful empty/error states.
- Central authentication provider with login, logout, restoration, role enforcement, protected routes, and expired-session messaging.
- Reusable status badges, metric cards, assignment cards, submission lists, proof panels, hash comparison, activity timeline, dialogs, and form controls.

### Professor workflow
- Login into the Academic Integrity Command Center.
- Overview metrics, restrained activity visualization, recent submissions, and verification activity.
- Assignment list plus validated create-assignment dialog and assignment detail/submissions view.
- Responsive submissions list, submission details, blockchain proof, and document actions.
- Strong document verification screen with explicit trusted/current hash comparison and verified/tampered outcomes.
- Focused activity and settings pages.

### Student workflow
- Distinct Secure Submission Workspace dashboard with upcoming work and recent submission status.
- Assignment browsing and assignment details.
- Document Vault PDF selection, validation, removal, and service-driven submission progress.
- Submission receipt with proof fields populated only from service responses.
- Searchable/filterable submission history and submission details.
- Focused activity and settings pages.

## Routes
- Public: `/` redirects appropriately, `/login`.
- Professor: `/professor`, `/professor/assignments`, `/professor/assignments/:id`, `/professor/submissions`, `/professor/submissions/:id`, `/professor/verification`, `/professor/activity`, `/professor/settings`.
- Student: `/student`, `/student/assignments`, `/student/assignments/:id`, `/student/submit/:assignmentId`, `/student/submissions`, `/student/submissions/:id`, `/student/activity`, `/student/settings`.
- Every route gets unique page metadata and role protection.

## Technical details
- Preserve TanStack Start and TanStack Router rather than adding a second router.
- Use existing Tailwind and shadcn primitives with Lucide icons; add no backend, database, smart contract, wallet, or blockchain transaction code.
- Real mode will target `VITE_API_URL`, defaulting to `http://localhost:5000/api`; unknown verification contracts remain explicit unsupported/TODO boundaries rather than guessed endpoints.
- Mock login will clearly use demo identities and never imply production authentication or real chain activity.
- Validate desktop and mobile layouts, role routing, login, assignment creation, upload progress, receipt, filtering, and verification flows in the running preview.

## Delivery order
1. Design tokens, types, service boundary, mock adapter, and authentication state.
2. Shared responsive shell and reusable integrity/document components.
3. Login and professor core workflow.
4. Student core workflow and document submission receipt.
5. Secondary activity/settings screens, responsive polish, metadata, and end-to-end verification.
