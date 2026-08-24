# Super Admin Portal

The Super Admin Portal is the platform-level administration console for Shmeta. It manages ordinary admin accounts and provides global account statistics.

## Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Backend API: Express and SQLite

## Run Locally

1. Configure the backend environment. Copy `backend/.env.example` to `backend/.env` and provide real values for all required variables.
2. Start the backend:

```powershell
cd backend
npm install
npm start
```

3. Configure the frontend API URL in `super-admin/.env`:

```text
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend:

```powershell
cd super-admin
npm install
npm run dev
```

The Vite development server uses port `5174`. The production preview uses port `4174`.

## Authentication

Login accepts either the configured super-admin phone or name. The frontend stores short-lived access and refresh tokens in local storage. Access-token `401` responses trigger one refresh attempt; login requests never attempt refresh. Refresh tokens are rotated and persisted in `super_admin_tokens`.

Super-admin access tokens contain:

```json
{ "id": "super-admin-id", "phone": "...", "type": "super_admin" }
```

Protected API requests use:

```text
Authorization: Bearer <accessToken>
```

## Frontend Routes

- `/` - sign in
- `/ZGFzaGJvYXJk` - dashboard
- `/bWFuYWdl` - admin management

There is no forgot-password route. The unused route was removed until a secure recovery process is designed.

## API

The backend base URL is `/api`.

### Authentication

`POST /super-auth/login`

```json
{ "phone": "name-or-phone", "password": "..." }
```

`POST /super-auth/refresh`

```json
{ "refreshToken": "..." }
```

`POST /super-auth/logout`

```json
{ "refreshToken": "..." }
```

`GET /super-auth/me` requires a bearer access token.

`PUT /super-auth/change-password` requires a bearer access token:

```json
{ "currentPassword": "...", "newPassword": "..." }
```

A missing super-admin record returns `404`. Invalid or expired refresh tokens return `401`.

### Dashboard and Admin Management

All routes below require a super-admin bearer token.

- `GET /super/admins` - list admins without password data
- `GET /super/admins/stats` - global admin, owner, cashier, and cutter statistics
- `GET /super/admins/:id` - get one admin without password data
- `POST /super/admins` - create an admin; requires `name`, valid `phone`, and a password of at least six characters
- `PUT /super/admins/:id` - update `name` and `phone`
- `DELETE /super/admins/:id` - delete an admin and linked owners; dependent owner records cascade through the database
- `PATCH /super/admins/:id/status` - set `status` to `Active` or `Inactive`
- `PATCH /super/admins/:id/reset-password` - replace the hashed password

Bulk endpoints:

- `POST /super/admins/bulk/delete` with `{ "ids": ["..."] }`
- `POST /super/admins/bulk/status` with `{ "ids": ["..."], "status": "Active" }`
- `POST /super/admins/bulk/reset-password` with `{ "ids": ["..."], "password": "..." }`

Bulk IDs must be a non-empty array of unique non-empty strings. Bulk status accepts only `Active` or `Inactive`. Bulk passwords must contain at least six characters. Missing IDs produce `404` rather than a false success.

## Security Notes

- Passwords are stored only as bcrypt hashes. Password reveal endpoints do not exist.
- Existing legacy admin plaintext-password values are cleared during database initialization.
- Deactivating an admin deletes its refresh sessions and blocks its existing access tokens.
- `JWT_SECRET` and `JWT_REFRESH_SECRET` must be different, non-placeholder values of at least 32 characters.
- `ADMIN_PHONE`, `ADMIN_PASSWORD`, `SUPER_ADMIN_PHONE`, `SUPER_ADMIN_PASSWORD`, and `SUPER_ADMIN_NAME` are required environment values. No development credentials are hardcoded.

## Validation

```powershell
cd super-admin
npm run build
```

```powershell
cd backend
node --check src/server.js
```

Run the backend integration tests with:

```powershell
cd backend
npm test
```

Run the frontend authentication tests with:

```powershell
cd super-admin
npm test
```
