# AGENTS.md

## Commands

```sh
npm install              # root — backend deps
npm run dev              # root — concurrently runs backend:3001 + frontend:3000
```

Frontend commands (from `frontend/`):

```sh
npm install              # separate install (NOT covered by root npm install)
npm start                # CRA dev server on :3000
npm test                 # react-scripts test (Jest + RTL)
npm run build            # production build
```

- **No lint or typecheck** configured anywhere.
- Three `package.json` (root, frontend/, backend/) — each needs its own `npm install`.

## Architecture

Strict dependency rule — `frontend/src/` layers import inward only:

```
domain/       → no project imports (pure JS)
application/  → may import domain/
infrastructure/ → may import domain/
presentation/ → may import application/ and infrastructure/
di.js         → composition root, imports everything
```

- Do **not** instantiate repositories or use cases outside `di.js`.
- Use cases receive the repository via constructor: `new GetTodos(todoRepository)`.
- `ExportTodosPDF.execute(todos)` takes the raw array directly, **not** via repository.
- All source imports use explicit `.js` extensions.
- `App.css` lives at `src/App.css` (not in `presentation/components/`) — App.js imports it as `../../App.css`.

## Testing

- `jest.mock('jspdf', ...)` / `jest.mock('jspdf-autotable', ...)` required in any test importing App or ExportTodosPDF. See `src/App.test.js` for the exact mock pattern.
- Only `App.test.js` exists — no tests for use cases, mapper, or repositories.

## Storage

- `localStorage` key: `"todos"` (JSON array). Frontend **never** calls the backend API.
- ID generation: `Math.max(...items.map(t => t.id)) + 1` (returns 1 if empty).

## Backend

- Express 4 in `backend/`. Root `package.json` lists express@5 but it is unused at runtime.
- In-memory array — **not persisted** across restarts.
- Port: `PORT` env var or 3001. Routes: `/api/health`, `/api/greet`, `/api/todos` CRUD.

## Gotchas

- `frontend/` is a git submodule (mode 160000 in index, but **no `.gitmodules`** file). Changes inside it must be committed in a separate repo.
- UI error messages are in **Spanish** (see `App.js` error strings).
- Key design docs: `SDD.md` (architectural details, Spanish), `STACK.md` (tech stack, English).

## Search

- Search is client-side filtering in `App.js`. A `searchTerm` state drives a derived `filteredTodos` array that filters `todos` by `todo.title` (case-insensitive). No use case or repository method needed.


### Tools 

when you need to search docs, use `context7`  tools.