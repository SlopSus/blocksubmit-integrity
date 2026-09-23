# BlockSubmit

## Blockchain-Based Academic Assignment Submission & Integrity Verification System

BlockSubmit is a university project designed to provide tamper-evident academic assignment submission and document integrity verification.

The system combines a conventional web application with blockchain-based integrity proof.

---

## Overview

BlockSubmit follows a hybrid architecture:

```text
Student / Professor
        ↓
React Frontend
        ↓
Node.js + Express API
        ↓
MongoDB
```

For document integrity:

```text
PDF
 ↓
SHA-256 Hash
 ↓
Smart Contract
 ↓
Blockchain Proof
 ↓
Professor Verification
```

The PDF itself is handled by the backend. The blockchain is used as the integrity-proof layer rather than storing the complete document.

If a submitted PDF is modified, its SHA-256 hash changes. The professor can compare the current document hash with the trusted hash recorded during submission.

---

## Features

### Student

- Secure authentication
- View assignments
- View deadlines and submission status
- Upload PDF assignments
- Submit documents
- View submission progress
- View submission history
- View blockchain proof
- View document integrity status

### Professor

- Secure authentication
- Dashboard overview
- Create and manage assignments
- View student submissions
- View submission details
- Verify document integrity
- Compare trusted and current hashes
- View blockchain transaction information
- Identify verified, pending, and tampered submissions

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Router
- Lucide Icons

### Backend

The backend is developed separately.

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcrypt/bcryptjs

### Blockchain

- Solidity
- Hardhat / Remix
- ethers.js
- Smart Contract
- Blockchain transaction records

---

## Frontend Architecture

The frontend uses a service/API boundary so that the interface can operate independently of the backend during development.

```text
src/
├── components/
├── layouts/
├── pages/
├── routes/
├── services/
│   ├── api/
│   └── mock/
├── hooks/
├── types/
├── utils/
└── assets/
```

Mock data is isolated from UI components so that the mock implementation can later be replaced by the real backend API with minimal changes to the interface.

---

## Backend API

The frontend is designed to communicate with the BlockSubmit backend.

Currently defined backend endpoints include:

```text
POST /api/auth/login
GET  /api/auth/me

GET  /api/assignments
POST /api/assignments

POST /api/submissions
```

The verification endpoint will be integrated when the backend API contract is finalized.

The frontend does not assume undocumented backend endpoints.

---

## Document Integrity Workflow

1. The student uploads a PDF.
2. The backend calculates the PDF's SHA-256 hash from the document bytes.
3. The submission is stored in the database.
4. The document hash is recorded through the blockchain smart contract.
5. The professor can verify the submitted document.
6. The current PDF hash is compared with the trusted submission hash.

```text
Current PDF Hash
       ↓
Compare with
       ↓
Trusted Submission Hash
       ↓
   Hash Match?
    ↙       ↘
  YES        NO
   ↓          ↓
VERIFIED   TAMPERED
```

If the hashes match, the document is considered **VERIFIED**.

If the hashes differ, the document is reported as **TAMPERED**.

---

## Verification States

| Status | Meaning |
|---|---|
| `PENDING` | Submission or verification is still processing |
| `VERIFIED` | Current document hash matches the trusted hash |
| `TAMPERED` | Current document hash does not match the trusted hash |

Blockchain transaction hashes, block numbers, timestamps, and verification results should come from the backend when the application is connected to the real API.

---

## Development

### Requirements

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/SlopSus/blocksubmit-integrity.git
cd blocksubmit-integrity
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## Project Structure

```text
BlockSubmit
│
├── public/
│
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── assets/
│
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Security Model

BlockSubmit separates normal application data from the blockchain integrity layer.

MongoDB is used for application and submission data.

The blockchain is used to provide tamper-evident integrity proof.

The core process is:

```text
PDF Bytes
    ↓
SHA-256
    ↓
Document Fingerprint
    ↓
Blockchain Record
```

If the PDF is modified after submission, its SHA-256 hash changes. The verification process can therefore detect a mismatch between the trusted hash and the current document hash.

The complete PDF is not stored on the blockchain.

---

## Mock Development Mode

Because the frontend and backend are being developed separately, the frontend supports an isolated mock/demo service.

Mock data is kept separate from the UI so that it can later be replaced by the real API.

The intended configuration is:

```env
VITE_USE_MOCK_API=true
VITE_API_URL=http://localhost:5000/api
```

Mock mode is intended for frontend development and demonstration before backend integration.

When real API mode is enabled, blockchain information and verification results should come from the backend rather than fabricated frontend values.

---

## Current Development Status

### Frontend

- Authentication UI
- Student dashboard
- Professor dashboard
- Assignment management
- PDF submission workflow
- Submission history
- Document verification UI
- Blockchain proof UI
- Mock API support
- Responsive design

### Backend

The backend is being developed separately using:

- Node.js
- Express
- MongoDB
- JWT authentication
- Solidity
- ethers.js
- Blockchain integration

### Integration

Frontend and backend integration will be completed after the backend API contracts are finalized.

---

## Project Goal

BlockSubmit aims to provide a tamper-evident academic assignment submission and verification system.

The core workflow is:

```text
DOCUMENT
    ↓
INTEGRITY
    ↓
VERIFICATION
    ↓
BLOCKCHAIN PROOF
```

BlockSubmit is developed as a university academic project.