# Research-Portal-
A full-stack University Research Opportunity Portal built with React.js, JavaScript, HTML, CSS, Node.js, Express.js, Redux, and PostgreSQL to create, view, update, and manage university research opportunities through a REST API.

## Backend

The Express API is in `backend/`. Start it with Node.js and PostgreSQL available:

```sh
cd backend
npm install
npm start
```

The Prisma client is generated automatically before starting the server. For
development with automatic restarts, use `npm run dev` instead.

The server listens on port `5000` by default. Set the `PORT` environment variable
to use a different port. `GET /api/health/db` checks the database connection.

### Database setup and API collection

The Prisma schema is in `backend/prisma/schema.prisma`. For an existing
PostgreSQL database, apply the discovery-field migration described below before
using the opportunity discovery fields.

The Postman collection is in
`postman/Research Portal.postman_collection.json`. Import it into Postman to
run the health checks and opportunity CRUD requests against the local API. Its
`baseUrl` collection variable defaults to `http://localhost:5000/api`; the
`opportunityId` variable is updated automatically after a successful create
request.

## Frontend

The React application is in `frontend-vite/` (the sole active frontend). Start
it in a separate terminal:

```sh
cd frontend-vite
npm install
npm run dev
```

Vite serves the frontend at `http://localhost:5173/`. The application connects to
the backend at `http://localhost:5000` and provides these pages:

- `/` — portal home
- `/opportunities` — browse opportunities
- `/opportunities/:id` — view an opportunity
- `/create` — create an opportunity
- `/update/:id` — update an opportunity
- `/delete/:id` — confirm and delete an opportunity

The frontend build and lint commands are `npm run build` and `npm run lint`.

### Student dashboard

The `/dashboard` page currently uses a browser-local student profile and
localStorage for saved opportunities, applications, and recently viewed items.
Use **Student sign in** to create a local demo profile; dashboard access and
records are scoped to the email entered in that browser. This is not
server-side authentication and must not be used to protect private data in
production. The existing Express API has no student login/authentication, so
student-specific API routes and database migrations are intentionally not
exposed until a real authentication system is added.

### Opportunity discovery data

Before using the discovery filters against an existing database, apply
`backend/database/migrations/20261014_smart_opportunity_discovery.sql` to the
PostgreSQL database configured by `DATABASE_URL`. The migration adds paid/work
arrangement, skills, keywords, and creation-date fields and backfills skills
and keywords from existing opportunity records. In PowerShell, run:

```powershell
psql "$env:DATABASE_URL" -f "backend\database\migrations\20261014_smart_opportunity_discovery.sql"
```

No additional packages are required.
