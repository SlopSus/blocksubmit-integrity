# BlockSubmit Integrity

# BLOCKSUBMIT — FRONTEND DASHBOARD IMPLEMENTATION

You are the lead frontend engineer and UI/UX designer for my university

project called:

BLOCKSUBMIT

Blockchain-Based Academic Assignment Submission & Integrity Verification

System

IMPORTANT:

THIS TASK IS FRONTEND ONLY.

Do NOT build, modify, simulate, or replace the backend.

Do NOT create an Express server.

Do NOT create MongoDB models.

Do NOT create Solidity contracts.

Do NOT implement blockchain transactions in the frontend.

Do NOT create fake blockchain functionality.

My teammate is independently developing the Node.js + Express + MongoDB +

Solidity/Hardhat/ethers.js backend.

Your job is to create a polished, production-quality FRONTEND DASHBOARD

that will connect to that backend later.

============================================================

1. UNDERSTAND THE PROJECT

============================================================

BlockSubmit solves a specific academic integrity problem.

Normal academic submission systems store PDFs and submission information

in a conventional database. If a stored document is modified later,

there may be no independent way to prove that it changed.

BlockSubmit combines:

STUDENT

   ↓

REACT FRONTEND

   ↓

NODE.JS + EXPRESS API

   ↓

MONGODB

   +

SHA-256 DOCUMENT HASH

   ↓

SOLIDITY SMART CONTRACT

   ↓

BLOCKCHAIN PROOF

   ↓

PROFESSOR VERIFICATION

   ↓

VERIFIED / TAMPERED

The database is used for normal application data and PDF storage.

The blockchain is used as the tamper-evident integrity layer.

The important concept is:

PDF BYTES

   ↓

SHA-256

   ↓

DOCUMENT FINGERPRINT

   ↓

BLOCKCHAIN RECORD

If the PDF changes, its SHA-256 hash changes.

The professor can therefore compare the current document hash against the

trusted hash recorded during submission.

The project documentation describes this hybrid architecture and explicitly

uses React, Node.js + Express, MongoDB, Solidity and ethers.js.

It also describes the student submission flow and professor verification

flow.

Do not change this core concept.

============================================================

2. CURRENT BACKEND STATUS

============================================================

The backend is being built separately by another teammate.

Current backend stack:

- Node.js

- Express

- MongoDB

- Mongoose

- JWT authentication

- bcrypt/bcryptjs

- Solidity smart contract

- Hardhat / Remix

- ethers.js

Current backend responsibilities include:

AUTHENTICATION

POST /api/auth/login

GET  /api/auth/me

ASSIGNMENTS

GET  /api/assignments

POST /api/assignments

SUBMISSIONS

POST /api/submissions

The backend handles:

- authentication

- authorization

- assignment management

- PDF processing

- SHA-256 hashing

- MongoDB persistence

- blockchain transactions

- transaction confirmation

- transaction information

- submission status

- verification

- tamper detection

When a student submits a PDF:

PDF

→ backend receives file

→ SHA-256 hash is generated from actual PDF bytes

→ submission is stored

→ smart contract transaction is created

→ blockchain transaction is confirmed

→ real transaction information is returned

Possible submission/verification states include:

PENDING

VERIFIED

TAMPERED

IMPORTANT:

The frontend must NEVER invent blockchain transaction hashes,

block numbers, timestamps, hashes, verification results, or statistics.

============================================================

3. FRONTEND RESPONSIBILITY

============================================================

Build ONLY the frontend.

The frontend should be ready to connect to:

VITE_API_URL=http://localhost:5000/api

Create a clean API/service abstraction so the UI never directly scatters

fetch/axios calls throughout components.

Recommended architecture:

src/

  components/

  pages/

  layouts/

  services/

    api.ts

    auth.ts

    assignments.ts

    submissions.ts

  hooks/

  types/

  utils/

  mock/

  assets/

If the backend is not connected yet, create a clearly isolated MOCK/DEMO

API adapter or repository layer.

VERY IMPORTANT:

Do NOT put mock values directly inside dashboard components.

The UI should consume data through services/hooks.

Later I should be able to replace:

mock service

    ↓

real API service

without redesigning the UI.

Keep the API boundary clean.

============================================================

4. TECH STACK

============================================================

Use:

- React

- Vite

- TypeScript

- Tailwind CSS

- shadcn/ui where useful

- React Router

- Lucide icons

- modern reusable components

Use the existing project setup if one already exists.

Do not unnecessarily replace working infrastructure.

Prefer clean reusable components over huge page files.

============================================================

5. DESIGN DIRECTION

============================================================

THIS IS EXTREMELY IMPORTANT.

I do NOT want a generic AI-generated admin dashboard.

I want:

DARK

PREMIUM

CLEAN

ACADEMIC

PROFESSIONAL

MODERN

WEB3/DAPP-INSPIRED

BUT NOT CHEESY CYBERPUNK

The interface should look like a serious modern academic integrity

platform combined with the polish of a professional DApp.

Think:

Academic Security

+

Document Verification

+

Blockchain Infrastructure

+

Premium SaaS/DApp UX

NOT:

generic Bootstrap dashboard

generic university portal

generic CRUD admin panel

overly neon cyberpunk website

gaming UI

excessive glassmorphism

huge glowing gradients everywhere

============================================================

6. VISUAL LANGUAGE

============================================================

Primary environment:

- near-black / deep navy background

- charcoal surfaces

- dark blue-gray panels

- subtle blue/cyan/violet accents

- restrained gradients

- thin borders

- soft shadows

- excellent contrast

- subtle depth

Use accent colors primarily for:

- active navigation

- buttons

- status indicators

- verification states

- blockchain indicators

- important metrics

Do NOT make the entire UI glow.

Typography:

Prefer:

Inter

or

Manrope

or

Plus Jakarta Sans

Use strong typography hierarchy.

Spacing should feel intentional and premium.

Cards should have:

- subtle border

- moderate radius

- restrained shadow

- clear hierarchy

- good internal spacing

Avoid excessive rounded cards everywhere.

============================================================

7. APP STRUCTURE

============================================================

Create a proper application shell.

Desktop:

LEFT SIDEBAR

+

TOP HEADER

+

MAIN CONTENT

Sidebar should contain:

BLOCKSUBMIT logo/wordmark

Professor:

Overview

Assignments

Submissions

Verification

Activity

Settings

Student:

Overview

Assignments

My Submissions

Verification

Activity

Settings

At the bottom:

User profile

Role

Logout

Top header:

- page title/breadcrumb

- search where useful

- notifications

- profile/avatar

- connection/system status where appropriate

Mobile:

Convert sidebar into a responsive drawer/navigation.

The UI must be responsive.

============================================================

8. LOGIN PAGE

============================================================

Create a premium login experience.

Split-screen or asymmetric layout is preferred.

Left:

BlockSubmit branding

short explanation

academic integrity message

subtle blockchain/document visual

Right:

Login card

Fields:

Email

Password

Role should be determined by authenticated backend user where possible.

Do NOT ask users to manually select a role unless the API actually

requires it.

States:

- loading

- invalid credentials

- server error

- successful login

Use realistic error handling.

Do not fake successful authentication.

For demo mode, clearly isolate mock authentication behind the mock

service.

============================================================

9. PROFESSOR DASHBOARD

============================================================

Create a premium:

ACADEMIC INTEGRITY COMMAND CENTER

This is the main professor dashboard.

Top section:

Good morning, Professor

Academic integrity overview

Statistics should be displayed as elegant metric cards:

TOTAL ASSIGNMENTS

ACTIVE ASSIGNMENTS

TOTAL SUBMISSIONS

VERIFIED

PENDING

TAMPERED

IMPORTANT:

These numbers must come from a service/data layer.

Do not hardcode numbers inside UI components.

For current frontend-only development, demo values may come from the

isolated mock service.

Include useful visualizations only if they improve the dashboard.

Possible:

Submission activity over time

Verification status distribution

Recent submissions

Recent verification activity

Do not overcrowd the dashboard.

============================================================

10. PROFESSOR RECENT SUBMISSIONS

============================================================

Create a polished table/list.

Columns:

Student

Assignment

Document

Submitted

Status

Blockchain

Action

Statuses:

PENDING

VERIFIED

TAMPERED

Use visually distinct but restrained badges.

Actions:

View

Verify

Details

Make the table excellent on desktop and usable on mobile.

============================================================

11. ASSIGNMENTS PAGE — PROFESSOR

============================================================

Professor should be able to:

View assignments

Create assignment

Open assignment

View submissions

Assignment card/table should show:

Title

Description

Deadline

Status

Submission count

Created date

Create Assignment modal/page:

Title

Description

Deadline

Validation:

- required fields

- sensible deadline validation

- loading state

- API error state

- success state

The UI should be ready for:

POST /api/assignments

============================================================

12. SUBMISSION DETAILS

============================================================

Create a strong submission detail page.

Show:

Student

Assignment

PDF filename

File size

Submission date

Submission status

Integrity section:

TRUSTED HASH

CURRENT HASH

HASH MATCH

Blockchain section:

Transaction Hash

Block Number

Blockchain Timestamp

Transaction Status

Do not invent these values.

If values are unavailable, show:

Not available

rather than fake information.

Include actions:

Verify Document

View Document

Back to submissions

============================================================

13. VERIFICATION PAGE

============================================================

This should be one of the strongest pages in the entire application.

Title:

DOCUMENT INTEGRITY VERIFICATION

Create a visual verification panel.

Successful state:

✓ VERIFIED

DOCUMENT INTEGRITY CONFIRMED

"Current document hash matches the trusted submission hash."

Tampered state:

⚠ TAMPERED

DOCUMENT INTEGRITY COMPROMISED

"Current document hash does not match the trusted submission hash."

Also show:

Student

Assignment

Filename

Submission timestamp

Hash comparison:

TRUSTED HASH

xxxxxxxxxxxxxxxx

CURRENT HASH

xxxxxxxxxxxxxxxx

HASH MATCH

YES / NO

Blockchain proof:

Transaction hash

Block number

Timestamp

Status

Make the comparison visually obvious.

A professor should immediately understand:

WHAT WAS SUBMITTED

WHAT HASH WAS TRUSTED

WHAT HASH EXISTS NOW

WHETHER THEY MATCH

Do NOT merely show a green/red badge.

============================================================

14. STUDENT DASHBOARD

============================================================

Create a DISTINCT student experience.

Do not duplicate the professor dashboard.

Concept:

SECURE SUBMISSION WORKSPACE

Top section:

Welcome back, Student

Track your assignments and document integrity.

Metrics:

Active Assignments

Pending Submissions

Completed

Verified

Then:

Upcoming assignments

Recent submissions

Submission status

Each assignment should clearly communicate:

Title

Deadline

Submission status

Action

============================================================

15. STUDENT ASSIGNMENTS

============================================================

Create a clean assignment browsing experience.

Assignment card:

Title

Description

Deadline

Status

Submission state

CTA:

View Assignment

============================================================

16. ASSIGNMENT SUBMISSION PAGE

============================================================

This should feel like a premium:

DOCUMENT VAULT

experience.

Show:

Assignment title

Description

Deadline

Submission requirements

Large upload zone:

DROP YOUR PDF HERE

or

Browse Files

Accept PDF only.

After selecting:

Filename

File size

PDF icon

Validation state

Remove file

Then:

SUBMIT DOCUMENT

During submission, create a visual progress flow:

1. Uploading document

2. Generating integrity hash

3. Recording proof

4. Confirming transaction

5. Submission complete

IMPORTANT:

These states must be driven by actual API state later.

Do not pretend blockchain confirmation happened if the API has failed.

For frontend-only demo mode, simulate these states through the mock service,

but keep them inside the service layer.

============================================================

17. SUBMISSION SUCCESS

============================================================

After a successful submission show:

✓ SUBMISSION RECORDED

Document

Assignment

Submitted at

Integrity status

Blockchain proof section:

Transaction Hash

Block Number

Blockchain Timestamp

CTA:

View Submission

Return to Assignments

The visual treatment should feel like a receipt/proof of submission.

============================================================

18. STUDENT SUBMISSION HISTORY

============================================================

Create:

MY SUBMISSIONS

Show:

Assignment

Document

Submitted

Status

Blockchain proof

Action

Allow filtering:

All

Pending

Verified

Tampered

Search by assignment/document name.

============================================================

19. ACTIVITY PAGE

============================================================

Create a useful activity timeline.

Examples:

Assignment created

Submission received

Document verified

Integrity mismatch detected

Do not invent events in production mode.

For mock/demo mode, activity should come from the mock service.

============================================================

20. SETTINGS

============================================================

Keep this meaningful but simple.

Sections:

Profile

Account

Security

Application

Do not create useless settings just to increase page count.

============================================================

21. NAVIGATION / ROUTING

============================================================

Implement proper routes.

Example:

/login

/professor

/professor/assignments

/professor/assignments/:id

/professor/submissions

/professor/submissions/:id

/professor/verification

/professor/activity

/professor/settings

/student

/student/assignments

/student/assignments/:id

/student/submissions

/student/submissions/:id

/student/submit/:assignmentId

/student/activity

/student/settings

Protect authenticated routes.

Respect user role.

Do not allow student UI routes to be accessed as professor and vice versa.

============================================================

22. API SERVICE LAYER

============================================================

Create a clean frontend API layer around:

VITE_API_URL

Example conceptual structure:

authService

assignmentService

submissionService

verificationService

dashboardService

The components should NOT directly contain fetch calls.

Use centralized:

- request handling

- auth token handling

- error normalization

- response parsing

Prepare the service layer for these backend endpoints:

POST /api/auth/login

GET /api/auth/me

GET /api/assignments

POST /api/assignments

POST /api/submissions

If verification has a separate backend endpoint that is not currently

specified, keep the frontend verification service interface ready without

inventing an incorrect endpoint.

Do not guess backend API contracts.

Where the exact endpoint is unknown, isolate it behind a TODO/configuration

boundary rather than creating fake backend assumptions.

============================================================

23. AUTHENTICATION STATE

============================================================

Create a centralized authentication state.

It should support:

login

logout

current user

token persistence

loading state

session restoration

unauthorized response handling

If token expires or becomes invalid:

clear session

redirect to login

show a useful message

Do not expose tokens in the UI.

============================================================

24. LOADING / ERROR / EMPTY STATES

============================================================

Every important page needs:

LOADING STATE

SUCCESS STATE

ERROR STATE

EMPTY STATE

Examples:

No assignments yet.

No submissions found.

Unable to load submissions.

Backend unavailable.

Session expired.

Upload failed.

Invalid PDF.

Do not leave blank screens.

Use elegant skeleton loaders instead of spinners everywhere.

============================================================

25. FRONTEND-ONLY DEMO MODE

============================================================

Because frontend and backend are currently being developed separately,

create a clean development/demo mode.

IMPORTANT:

Mock data must NOT be scattered through components.

Create something like:

src/mock/

and/or

src/services/mock/

The application should have one obvious configuration point for switching:

MOCK API

vs

REAL API

Example concept:

VITE_USE_MOCK_API=true

When true:

frontend demonstrates the complete UI workflow using realistic structured

data.

When false:

frontend uses:

VITE_API_URL=http://localhost:5000/api

The mock implementation should imitate the shape of the real API as closely

as possible.

This is temporary frontend development infrastructure, NOT a replacement

for the backend.

============================================================

26. DEMO DATA

============================================================

Use realistic academic data.

Example entities:

Students

Professors

Assignments

PDF submissions

Transaction hashes

Block numbers

Verification states

But make it obvious in code that this is MOCK data.

Never present mock data as real blockchain data when real API mode is enabled.

============================================================

27. BLOCKCHAIN UI

============================================================

The frontend should communicate blockchain functionality visually without

trying to implement blockchain itself.

Useful visual concepts:

Blockchain Proof

Transaction

Block

Hash

Timestamp

Integrity

Use icons and restrained visual indicators.

Example:

Blockchain Proof

Confirmed

Transaction

0x....

Block

#12345

Do NOT fabricate values in REAL API mode.

Do NOT require MetaMask for the current frontend unless the backend/API

architecture later explicitly requires it.

The current backend is responsible for blockchain transactions.

============================================================

28. DASHBOARD UX PRINCIPLES

============================================================

The dashboard must be:

FAST TO UNDERSTAND

FAST TO NAVIGATE

VISUALLY HIERARCHICAL

NOT OVERCROWDED

A professor should understand the system within 5 seconds of opening the

dashboard.

A student should immediately know:

What assignments are active?

What is due?

What have I submitted?

Was my submission verified?

A professor should immediately know:

How many submissions exist?

What is verified?

What is pending?

Was anything tampered with?

What needs attention?

============================================================

29. IMPORTANT VISUAL FEATURE

============================================================

Create a subtle "Integrity Status" visual language.

VERIFIED:

calm green/teal treatment

PENDING:

amber/yellow treatment

TAMPERED:

red treatment

Do not use huge glowing colors.

Keep the interface professional.

============================================================

30. RESPONSIVENESS

============================================================

Must work properly on:

Desktop

Laptop

Tablet

Mobile

Do not simply shrink desktop UI.

Tables should become cards or horizontally scroll where appropriate.

Sidebar becomes mobile navigation.

Upload area remains usable on touch devices.

============================================================

31. ACCESSIBILITY

============================================================

Implement:

- keyboard navigation

- visible focus states

- accessible buttons

- semantic HTML

- sufficient contrast

- labels for form fields

- meaningful aria labels where needed

============================================================

32. ANIMATION

============================================================

Use subtle animations.

Good:

- page transitions

- hover states

- card entrance

- upload progress

- verification state transition

- skeleton loading

Avoid:

- excessive animations

- constantly moving backgrounds

- flashy neon effects

- distracting particles

The application should feel premium, not like a gaming website.

============================================================

33. DO NOT DO THESE THINGS

============================================================

DO NOT:

- build a backend

- create MongoDB

- create Express routes

- create Solidity contracts

- implement blockchain transactions

- invent backend endpoints

- hardcode dashboard statistics in components

- hardcode transaction hashes

- fake blockchain confirmations

- fake verification results in REAL API mode

- create duplicate dashboards

- create unnecessary pages

- create generic landing-page marketing sections

- add pricing pages

- add unnecessary social features

- add unnecessary AI features

- add wallet connection unless actually required

- add meaningless Web3 animations

- make everything neon

- use huge glassmorphism panels

- use generic Bootstrap styling

This is an actual university DApp-style application, not a marketing

template.

============================================================

34. CODE QUALITY

============================================================

Use:

- reusable components

- typed interfaces/types

- clean folder structure

- small maintainable components

- centralized API services

- centralized auth state

- reusable status badges

- reusable cards

- reusable tables

- reusable dialogs

- reusable form components

Avoid massive components.

Avoid duplicated code.

Avoid unnecessary dependencies.

============================================================

35. IMPORTANT FUTURE INTEGRATION REQUIREMENT

============================================================

The frontend and backend will be integrated later.

Therefore the most important architectural goal is:

MAKE THE FRONTEND EASY TO CONNECT TO THE REAL BACKEND.

The frontend must not become dependent on mock data structures that differ

from the backend.

Use clear TypeScript interfaces for:

User

Assignment

Submission

BlockchainProof

VerificationResult

DashboardStats

Activity

Keep API responses normalized.

When the backend is connected, the UI should require minimal changes.

============================================================

36. CURRENT PROJECT STATUS

============================================================

This is currently approximately 50% complete overall.

We are NOT trying to finish the entire project in this frontend task.

Current stage:

FRONTEND

→ building/polishing now

BACKEND

→ independently being developed by teammate

INTEGRATION

→ later

FINAL SYSTEM

→ later

Therefore focus heavily on:

1. Dashboard

2. Student workflow UI

3. Professor workflow UI

4. Submission UI

5. Verification UI

6. API architecture

7. Authentication UI/state

8. Premium visual design

9. Responsive design

10. Clean code

Do not spend effort implementing backend functionality.

============================================================

37. THE MOST IMPORTANT SCREENS

============================================================

Prioritize these screens first:

1. Login

2. Professor Dashboard

3. Professor Assignments

4. Professor Submissions

5. Submission Details

6. Document Verification

7. Student Dashboard

8. Student Assignments

9. Student Assignment Detail

10. PDF Submission / Document Vault

11. Student Submission History

These screens matter more than secondary settings/activity screens.

============================================================

38. DEMO EXPERIENCE

============================================================

The frontend should support this demonstration even before backend

integration:

PROFESSOR

Login

↓

Professor Dashboard

↓

View Assignments

↓

View Submissions

↓

Open Submission

↓

View Blockchain Proof

↓

Verify Document

↓

VERIFIED / TAMPERED

STUDENT

Login

↓

Student Dashboard

↓

View Assignment

↓

Open Assignment

↓

Upload PDF

↓

Submission Progress

↓

Submission Receipt

↓

View Submission History

Again:

This is a FRONTEND demonstration using an isolated mock service until the

real backend is connected.

============================================================

39. FINAL QUALITY BAR

============================================================

Before considering the frontend complete, check:

✓ Premium dark UI

✓ Looks like a professional DApp

✓ Does not look like a generic admin template

✓ Clear professor/student separation

✓ Responsive

✓ Login works

✓ Routing works

✓ Auth state works

✓ Dashboards work

✓ Assignment UI works

✓ Submission UI works

✓ Verification UI works

✓ Status system works

✓ Loading states work

✓ Error states work

✓ Empty states work

✓ Mock service isolated

✓ API service isolated

✓ No fake data scattered through components

✓ No backend implementation

✓ No invented blockchain logic

✓ No hardcoded dashboard statistics in components

✓ Clean reusable components

✓ TypeScript types

✓ Easy future backend integration

✓ No unnecessary features

============================================================

40. EXECUTION INSTRUCTION

============================================================

FIRST inspect the existing frontend/project structure if one already exists.

Preserve useful existing work.

Do not rebuild working components unnecessarily.

Implement the frontend in logical stages.

Prioritize the core screens before secondary features.

Do not give me long explanations.

Do not paste entire source files into chat.

Work directly on the project.

When making changes, summarize only:

- what was changed

- what remains

- any actual errors/blockers

The final result should feel like a polished university-level blockchain

application that could realistically be demonstrated to a review panel.

The central visual identity should communicate:

DOCUMENT

+

INTEGRITY

+

VERIFICATION

+

BLOCKCHAIN PROOF

not simply "crypto".

Build the frontend around the actual BlockSubmit concept.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/09b08422-a4bc-4f7a-b9ec-e55ef58bb593).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
