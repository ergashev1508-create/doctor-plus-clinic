# Doctor Plus 

Website and booking system for the Doctor Plus medical center in Bishkek.

## Features

- Public clinic landing page with doctors, services, prices, reviews, and contacts.
- Online booking flow with doctor and service selection.
- Admin dashboard for bookings, patients, reviews, and clinic data.
- Local JSON-backed storage for simple deployment.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deploy

This project includes `render.yaml` for Render deployment.

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm run start
```
