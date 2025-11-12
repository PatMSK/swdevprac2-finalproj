# BookYourBooth Frontend (Next.js)

A minimal Next.js frontend for the BookYourBooth API implementing authentication, exhibitions, and booking flows with role-based UI (admin/member).

## Quick Start

- Prerequisites: Node.js 18+
- Copy env and install deps

```
cd frontend
copy .env.local.example .env.local   # or manually create
npm install
npm run dev
```

App runs at `http://localhost:3000`.

Ensure backend is running at `http://localhost:5000` (or set `NEXT_PUBLIC_API_BASE_URL`). CORS in backend already allows `http://localhost:3000` in development.

## Pages

- `/login`, `/register`
- `/exhibitions` (public)
- `/exhibitions/[id]` (details + member booking)
- `/bookings` (member: list, delete)
- `/bookings/[id]` (member: edit)
- `/admin/exhibitions` (admin: create/list/delete)
- `/admin/exhibitions/[id]` (admin: edit)
- `/admin/bookings` (admin: list/delete)

## Notes

- JWT token stored in `localStorage` (`byb_auth`).
- Auth state via `AuthProvider` in `lib/AuthContext.jsx`.
- API wrapper in `lib/api.js` uses `NEXT_PUBLIC_API_BASE_URL`.
- Protected routes use `components/Protected.jsx` to redirect unauthenticated users and restrict by role.

## Limitations / Future Enhancements

- Admin booking edit UI could be added similarly to member edit.
- Basic styling only; consider integrating a component library.
- No client-side form validation beyond required fields.

