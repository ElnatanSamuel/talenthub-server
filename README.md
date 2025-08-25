# TalentHub API

Base URL: configurable by the web via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:4000`).

Health

- `GET /` or `GET /health` → `{ ok: true, name, version }`

## Auth

POST `/auth/login`

- Body: `{ email: string, password: string }`
- 200 → `{ ok: true, data: { token: string, user: { id, name, email, role, companyId? } } }`
- 401/400 on invalid credentials or missing fields

POST `/auth/register`

- Body: `{ name: string, email: string, password: string, role?: "candidate"|"recruiter" }`
- 201 → same shape as login
- 409 if email already exists

POST `/auth/logout`

- 200 → `{ ok: true, data: null }`

## Jobs

GET `/jobs`

- Query params (all optional):
  - `q`: text search over title/description/location/company.name
  - `location`: partial match
  - `type`: kebab-case CSV (`full-time,part-time,contract,internship`)
  - `companyId`
- 200 → `{ ok: true, data: Job[] }`
- Job shape:

```json
{
  "id": "string",
  "title": "string",
  "companyId": "string",
  "companyName": "string",
  "type": "full-time|part-time|contract|internship",
  "location": "string",
  "salary": "string?",
  "description": "string?",
  "vacancies": 1,
  "applicationsCount": 0
}
```

GET `/jobs/:id`

- 200 → `{ ok: true, data: Job }`
- 404 if not found

POST `/jobs`

- Body: `{ title, type, location, salary?, description?, vacancies?, companyId?, companyName? }`
- Company resolution:
  - If `companyId` and `companyName` → upsert company name
  - If only `companyName` → create new company
  - If neither → assign to fallback company `"private"` named `"Private Client"`
- 201 → `{ ok: true, data: Job }`
- 400 on missing required fields

## Applications

GET `/applications`

- Query: `userId` (optional). If provided, filters by candidate.
- 200 → `{ ok: true, data: Application[] }`
- Application shape:

```json
{
  "id": "string",
  "jobId": "string",
  "userId": "string",
  "status": "applied|review|interview|rejected|hired",
  "submittedAt": "ISO string",
  "note": "string?",
  "applicantName": "string?",
  "applicantEmail": "string?",
  "linkedin": "string?",
  "portfolio": "string?",
  "coverLetter": "string?",
  "resumeUrl": "string?"
}
```

GET `/applications/recruiter`

- Query: `companyId` (optional). If omitted, returns all (dev-friendly).
- 200 → `{ ok: true, data: RecruiterApplication[] }` with:

```json
{
  "id": "string",
  "jobId": "string",
  "jobTitle": "string",
  "userId": "string",
  "candidateName": "string",
  "candidateEmail": "string",
  "status": "applied|review|interview|rejected|hired",
  "submittedAt": "ISO string"
}
```

GET `/applications/:id`

- Detailed recruiter view.
- 200 → `{ ok: true, data: { id, status, submittedAt, note?, applicantName?, applicantEmail?, linkedin?, portfolio?, coverLetter?, resumeUrl, job: { id, title, companyId, companyName }, candidate: { id, name, email } } }`
- `resumeUrl` is normalized to absolute URL if originally relative (uses request host/protocol).
- 404 if not found

PATCH `/applications/:id/status`

- Body: `{ status: "applied"|"review"|"interview"|"rejected"|"hired" }`
- 200 → `{ ok: true, data: { id, status } }`
- 400 on missing status; 500 on update failure

GET `/applications/:id/resume`

- If `resumeUrl` is absolute (`http/https`) → HTTP redirect
- If relative → serves local file from `uploads/` with `Content-Type: application/pdf`

## Users

GET `/users`

- 200 → `{ ok: true, data: User[] }` with `{ id, name, email, role, companyId? }`

GET `/users/:id`

- 200 → single `User`
- 404 if not found

PUT `/users/:id`

- Body: `{ name?, email?, role? }`
- 200 → updated `User`
- 404 if not found

## Uploads

POST `/upload/resume`

- Multipart form-data, field `file`
- 201 → `{ ok: true, data: { url } }` where `url` is absolute if request host is available

## General

- CORS: enabled with credentials and `Authorization` header support.
- Static: `/uploads` serves local uploaded files (dev).
- Health: `GET /`, `GET /health`.
