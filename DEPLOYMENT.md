# Doctor Plus Deployment

This app is ready for a permanent public URL through Render.

## Recommended: Render

1. Create a GitHub repository for this project and push the `project` folder.
2. Go to Render and create a new `Blueprint`.
3. Connect the GitHub repository.
4. Render will read `render.yaml` automatically.
5. Deploy the service.

Render will use:

```bash
npm ci && npm run build
npm run start
```

The app will run with:

- `NODE_ENV=production`
- a generated `SESSION_SECRET`
- a persistent data file at `/var/data/clinic.json`

## Important

The app currently stores bookings, patients, admin users, and notifications in a JSON file. The Render disk keeps that file alive between restarts. Without the disk, data may disappear after deploys or restarts.

Render persistent disks require a paid web service. A free Render web service can still give you a public URL, but it is not a good fit for real booking data because local file changes are lost when the service restarts or spins down.

## Current Admin Login

```text
Username: doctorplus_admin
Password: admin2025
```

Change the password from the admin dashboard after the first deploy.
