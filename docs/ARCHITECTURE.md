# Architecture

The repository is a small JavaScript monorepo. Next.js owns the frontend and Express owns the versioned API under `/api/v1`. The intended request flow is Route -> Middleware -> Controller -> Service -> Model.

TanStack Query owns remote frontend state; Zustand is reserved for genuine client state. Mongoose models represent domain entities. Socket.IO is prepared for messaging. Payment, storage, email, maps, AI, and legal integrations are explicit future boundaries with no external calls today.
