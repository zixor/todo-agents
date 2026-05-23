# AGENTS.md

## Commands

```sh
npm run dev              # root — runs backend:3001 + frontend:3000 via concurrently
```

All other commands run from `frontend/`:

```sh
npm install              # install FE deps (root `npm install` is separate)
npm start                # CRA dev server on :3000
npm test                 # react-scripts test (Jest + RTL)
npm run build            # production build
```

## Architecture

Strict dependency rule — **outer layers import inner layers, never the reverse**:

```
domain/       → no project imports (pure JS)
application/  → may import domain/
infrastructure/ → may import domain/
presentation/ → may import application/ and infrastructure/
di.js         → composition root, imports everything
```

Do not instantiate repositories or use cases outside `di.js` — inject them.

## Testing quirks

- **jsPDF and jspdf-autotable must be mocked** in any test importing App or ExportTodosPDF (see `frontend/src/App.test.js` for the jest.mock pattern).
- No tests exist for use cases, mapper, or repositories yet (only `App.test.js` exists).

## Storage

- localStorage key: `"todos"` (JSON array of plain objects)
- ID generation: `Math.max(...existingIds) + 1` (returns 1 if empty)
- **Frontend does not use the backend API** — all persistence is localStorage.

## Backend

- Express 4 in `backend/` (root `package.json` lists express@5 but is unused at runtime).
- In-memory array, **not persisted** across restarts.
- Port from `PORT` env var or 3001.
- Frontend is fully self-contained via localStorage — does **not** call backend routes.

## Gotchas

- Three `package.json` files (root, frontend/, backend/) — each needs its own `npm install`.
- `ExportTodosPDF.execute(todos)` takes the todos array directly, **not** via repository.
- Use case constructors receive the repository: `new GetTodos(todoRepository)`.
