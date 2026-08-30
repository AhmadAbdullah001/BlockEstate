# BlockEstate

BlockEstate is an end-to-end real-estate marketplace and transaction workspace. It combines property discovery with physical inspection, document and ownership review, communication, negotiation, verified legal professionals, and an organized closing workflow. BlockEstate supports one user account that can both buy and sell.

## Stack

- Frontend: Next.js App Router, JavaScript, Tailwind CSS, React Hook Form, Zod, TanStack Query, Axios, Zustand, Lucide React
- Backend: Node.js, Express, MongoDB/Mongoose, JWT cookies, bcrypt, Helmet, CORS, rate limiting, Multer
- Real-time: Socket.IO foundation

## Structure

`frontend/` contains the Next.js application. `backend/` contains the Express API, models, middleware, integrations, and tests. `docs/` explains product behavior and architecture.

## Setup

Copy the three `.env.example` files to `.env` in the root, `frontend/`, and `backend/` as needed. Set `MONGODB_URI` and strong JWT secrets for a real environment.

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
npm run dev
```

Run services separately with `npm run dev:frontend` and `npm run dev:backend`. The API health check is `GET http://localhost:5000/api/v1/health`.

## Conventions

Use JavaScript and simple functions. Keep controllers thin, validate requests at the API boundary, keep server state in TanStack Query, and never store authentication tokens in localStorage. Blockchain, AI providers, external storage, payments, and legal integrations are intentionally deferred.
