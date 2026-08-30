# API

The current health endpoint is `GET /api/v1/health` and returns `{ success: true, message: "BlockEstate API is running" }`.

## Agent verification workspace

Every endpoint below requires an authenticated user with the `AGENT` role. An agent can only access an assignment that is assigned to their own agent profile.

- `GET /api/v1/agents/assignments/:verificationId` returns the assigned verification, property context, seller details, and property documents.
- `PATCH /api/v1/agents/assignments/:verificationId` updates one verification stage. Send `{ stage, status, notes?, issue? }`, where `stage` is one of `documentVerification`, `ownershipVerification`, `physicalInspection`, or `legalVerification`; `status` is `PENDING`, `IN_PROGRESS`, `PASSED`, or `FAILED`.
- `POST /api/v1/agents/assignments/:verificationId/evidence` uploads an evidence file as multipart form data (`file`, optional `type`). Cloudinary credentials are required for file storage.

When all stages pass, the property becomes `VERIFIED` and `ACTIVE`. A failed stage moves it to `ACTION_REQUIRED`.

Versioned route boundaries exist for auth, users, properties, verifications, inspections, documents, messages, offers, transactions, lawyers, payments, notifications, reviews, and admin. Feature endpoints currently return `501 NOT_IMPLEMENTED` until their workflows are built.
