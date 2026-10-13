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

## Frontend

The React application is in `frontend-vite/`. Start it in a separate terminal:

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
