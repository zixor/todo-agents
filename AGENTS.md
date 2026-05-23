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

- **No lint or typecheck** configured anywhere.
- Three `package.json` (root, frontend/, backend/) — each needs its own `npm install`.

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
- React components live in `presentation/components/`: `Button`, `Input`, `Checkbox`, `Form`, `Heading`, `Text`, `List`, `ListItem`. `App.js` is at `presentation/App.js`.
- Styling: `src/App.css` — single CSS file, no CSS modules.

## State

- Zustand `useTodoStore` in `presentation/store/useTodoStore.js`.
- Search is client-side: `searchTerm` state drives `filteredTodos` derived array.

## Testing

- `jest.mock('jspdf', ...)` / `jest.mock('jspdf-autotable', ...)` required for any test importing App or ExportTodosPDF. See `src/App.test.js` for exact mock.
- Only `App.test.js` exists — no tests for use cases, mapper, or repositories.

## Storage

- `localStorage` key `"todos"` (JSON array). Frontend **never** calls backend API despite backend/ existing.
- ID generation: `Math.max(...items.map(t => t.id)) + 1` (returns 1 if empty).

## Gotchas

- `frontend/` is a detached git submodule (mode 160000 in index, no `.gitmodules`). Changes inside it commit to a separate repo.
- UI error messages are in **Spanish** (store strings).
- `backend/` runs Express 4 on `PORT` or 3001. Not used by frontend at runtime.
