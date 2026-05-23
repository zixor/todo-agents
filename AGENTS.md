# AGENTS.md

## Commands

```sh
npm run dev              # root — concurrently runs backend:3001 + frontend:3000
```

Frontend (`frontend/`):

```sh
npm install              # NOT covered by root npm install
npm test                 # react-scripts test (Jest + RTL, single suite: App.test.js)
npm run build            # production build
```

- Three `package.json` (root, frontend/, backend/) — each needs its own `npm install`.
- No lint or typecheck configured anywhere.
- Root has express@5, backend/ has express@4 — only backend/ matters (frontend ignores it).

## Architecture

```
domain/       → no project imports (pure JS: Todo entity, TodoRepository abstract)
application/  → may import domain/ (use cases: GetTodos, CreateTodo, etc.)
infrastructure/ → may import domain/ (LocalStorageTodoRepository, TodoMapper)
presentation/ → may import application/ and infrastructure/
di.js         → composition root, wires everything
```

- Do **not** instantiate repositories or use cases outside `di.js`.
- Use cases receive repository via constructor: `new GetTodos(todoRepository)`.
- `ExportTodosPDF.execute(todos)` takes raw array directly, **not** via repository.
- All source imports use explicit `.js` extensions.
- React components live in `presentation/components/` — thin wrappers (Button, Input, etc.). `App.js` is at `presentation/App.js`.
- Styling: `src/App.css` — single CSS file, no CSS modules. CSS vars in `index.css`.

## State

- Zustand `useTodoStore` in `presentation/store/useTodoStore.js`.
- Search is client-side: `searchTerm` drives `filteredTodos` derived array.

## Testing

- `jest.mock('jspdf', ...)` and `jest.mock('jspdf-autotable', ...)` required for any test importing App or ExportTodosPDF (see `App.test.js` for exact mock).
- Only `App.test.js` exists — no tests for use cases, mapper, or repositories.

## Gotchas

- `frontend/` is a detached git submodule (mode 160000 in index, no `.gitmodules`). `git status` at root won't show changes inside it — run `git` commands from `frontend/` directly.
- UI strings are in **Spanish** (store messages, placeholders).
- `backend/` runs Express 4 on `PORT` or 3001 with in-memory array (no persistence). **Not used by frontend at runtime** — all data goes through `localStorage`.
- `axios` is listed in both root and frontend `package.json` but is **unused** in the frontend source.
- Project-local skills at `.agents/skills/` — currently `frontend-cr` and `frontend-design`.
