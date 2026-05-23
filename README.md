# Todo App — Gestión de Tareas con Clean Architecture

Aplicación web para la gestión de tareas personales (CRUD) con arquitectura limpia en React, almacenamiento en `localStorage` y exportación a PDF. Totalmente funcional sin conexión a internet.

---

## ✨ Funcionalidades

| Funcionalidad | Descripción |
|--------------|-------------|
| **Crear tarea** | Agrega una nueva tarea con un título (validación de campo no vacío) |
| **Listar tareas** | Visualiza todas las tareas creadas |
| **Editar tarea** | Modifica el título de una tarea existente |
| **Completar tarea** | Marca/desmarca una tarea como completada |
| **Eliminar tarea** | Elimina una tarea de la lista |
| **Exportar a PDF** | Descarga la lista de tareas como documento PDF formateado |
| **Persistencia local** | Los datos se conservan entre recargas del navegador |

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología | Versión | Categoría | Propósito |
|------------|---------|-----------|-----------|
| **React** | ^19.2.6 | UI Framework | Biblioteca para construir la interfaz de usuario basada en componentes |
| **react-dom** | ^19.2.6 | Renderizado | Renderizado de componentes React en el DOM del navegador |
| **react-scripts** | 5.0.1 | Toolchain | Configuración de Webpack, Babel, ESLint y build pipeline (Create React App) |
| **jsPDF** | ^4.2.1 | PDF | Generación de documentos PDF en el cliente |
| **jspdf-autotable** | ^5.0.8 | PDF | Plugin para crear tablas formateadas dentro de PDFs |
| **axios** | ^1.6.8 | HTTP | Cliente HTTP (instalado pero no utilizado en el frontend) |

### Testing (Frontend)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Jest** | incluido en react-scripts 5.0.1 | Test runner con assertion library |
| **@testing-library/react** | ^16.3.2 | Renderizado e interacción con componentes React en tests |
| **@testing-library/jest-dom** | ^6.9.1 | Matchers personalizados para aserciones sobre el DOM |
| **@testing-library/user-event** | ^13.5.0 | Simulación avanzada de eventos de usuario |
| **@testing-library/dom** | ^10.4.1 | Utilidades de testing para el DOM |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | ≥ 18 | Entorno de ejecución JavaScript del lado del servidor |
| **Express** | ^4.19.2 | Framework web para API REST |
| **cors** | ^2.8.5 | Middleware para habilitar CORS |
| **dotenv** | ^16.3.1 | Carga de variables de entorno desde archivo `.env` |
| **axios** | ^1.6.8 | Cliente HTTP (instalado, usado internamente si se requiere) |

### DevOps y Tooling

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **concurrently** | ^9.1.2 | Ejecución simultánea de procesos frontend y backend |

### Lenguaje

| Tecnología | Versión | Ámbito |
|------------|---------|--------|
| **JavaScript (ES2022+)** | ECMAScript 2022+ | 100 % del código fuente |

### Almacenamiento

| Tecnología | Propósito |
|------------|-----------|
| **localStorage** (Web Storage API) | Persistencia de datos del lado del cliente, clave `"todos"`, formato JSON |
| **Backend en memoria** | Arreglo en RAM del servidor Express (no persiste entre reinicios) |

---

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con 4 capas y la **Regla de Dependencia** (las dependencias apuntan hacia adentro):

```
src/
├── domain/            ← Capa más interna — entidades y puertos
├── application/       ← Casos de uso (lógica de aplicación)
├── infrastructure/    ← Implementaciones concretas (repositorios, mappers)
├── presentation/      ← Componentes React (UI)
└── di.js              ← Composition Root (ensamblaje de dependencias)
```

### Diagrama de Capas

```
[Usuario]
    │
    ▼
┌─────────────────────────────────┐
│  Presentation (React)           │
│  └── App.js, App.css            │
└──────────┬──────────────────────┘
           │ execute()
           ▼
┌─────────────────────────────────┐
│  Application (Use Cases)        │
│  ├── GetTodos                   │
│  ├── CreateTodo                 │
│  ├── UpdateTodo                 │
│  ├── DeleteTodo                 │
│  └── ExportTodosPDF             │
└──────────┬──────────────────────┘
           │ opera sobre
           ▼
┌─────────────────────────────────┐
│  Domain (Entity & Port)         │
│  ├── Todo (entidad)             │
│  └── TodoRepository (puerto)    │
└──────────┬──────────────────────┘
           │ implementa
           ▼
┌─────────────────────────────────┐
│  Infrastructure                 │
│  ├── LocalStorageTodoRepository │
│  └── TodoMapper                 │
└──────────┬──────────────────────┘
           │ persiste en
           ▼
┌─────────────────────────────────┐
│  localStorage (navegador)       │
└─────────────────────────────────┘
```

### Patrones de Diseño

| Patrón | Uso |
|--------|-----|
| **Repository** | `TodoRepository` como interfaz abstracta, `LocalStorageTodoRepository` como implementación concreta |
| **Dependency Injection** | Los casos de uso reciben el repositorio vía constructor |
| **Command** | Cada caso de uso expone un método `execute()` uniforme |
| **Mapper** | `TodoMapper` separa la entidad de dominio del formato de persistencia |
| **Composition Root** | `di.js` centraliza la creación y el wireado de todas las dependencias |

---

## 🗂️ Estructura del Proyecto

```
/
├── backend/                    ← Servidor Express (API REST no utilizada desde el frontend)
│   ├── server.js               ← Punto de entrada del backend
│   └── package.json
├── frontend/                   ← Aplicación React (git submodule)
│   └── src/
│       ├── domain/
│       │   ├── entities/
│       │   │   └── Todo.js              ← Entidad de dominio
│       │   └── repositories/
│       │       └── TodoRepository.js    ← Puerto/interfaz del repositorio
│       ├── application/
│       │   └── use-cases/
│       │       ├── GetTodos.js          ← Obtener todas las tareas
│       │       ├── CreateTodo.js        ← Crear nueva tarea
│       │       ├── UpdateTodo.js        ← Actualizar tarea existente
│       │       ├── DeleteTodo.js        ← Eliminar tarea
│       │       └── ExportTodosPDF.js    ← Exportar a PDF
│       ├── infrastructure/
│       │   └── repositories/
│       │       ├── TodoMapper.js        ← Conversión dominio ↔ persistencia
│       │       └── LocalStorageTodoRepository.js  ← Repositorio concreto
│       ├── presentation/
│       │   └── components/
│       │       ├── App.js               ← Componente principal React
│       │       └── App.css              ← Estilos
│       ├── di.js                        ← Composition Root
│       ├── index.js                     ← Entry point de React
│       └── index.css                    ← Estilos globales
├── package.json                ← Dependencias raíz (backend + dev)
├── AGENTS.md                   ← Instrucciones para asistentes de IA
├── SDD.md                      ← Documento de Diseño de Software
├── STACK.md                    ← Descripción del stack tecnológico
└── README.md                   ← Este archivo
```

---

## 🚀 Instalación y Ejecución

### Requisitos

- Node.js ≥ 18
- npm ≥ 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd test

# 2. Instalar dependencias raíz (backend + herramientas)
npm install

# 3. Instalar dependencias del frontend (es un git submodule)
cd frontend
npm install
cd ..

# 4. Instalar dependencias del backend
cd backend
npm install
cd ..

# 5. Iniciar frontend y backend simultáneamente
npm run dev
```

El frontend arranca en **http://localhost:3000** y el backend en **http://localhost:3001**.

### Comandos Disponibles

| Comando | Ubicación | Descripción |
|---------|-----------|-------------|
| `npm run dev` | Raíz | Inicia backend (3001) y frontend (3000) concurrentemente |
| `npm start` | `frontend/` | Servidor de desarrollo React (puerto 3000) |
| `npm test` | `frontend/` | Ejecuta pruebas con Jest + React Testing Library |
| `npm run build` | `frontend/` | Build de producción |

---

## 🧪 Pruebas

```bash
cd frontend
npm test
```

- Se usa **Jest** + **React Testing Library**
- `jsPDF` y `jspdf-autotable` deben estar mockeados en cualquier test que importe `App` o `ExportTodosPDF`
- Actualmente solo existe `App.test.js`

---

## 💾 Almacenamiento

| Aspecto | Detalle |
|---------|---------|
| **Tecnología** | `localStorage` del navegador |
| **Clave** | `"todos"` |
| **Formato** | JSON array de objetos planos |
| **Generación de IDs** | `Math.max(...items.map(t => t.id)) + 1` (retorna 1 si está vacío) |
| **Persistencia** | Los datos sobreviven recargas del navegador |

> ⚠️ El frontend **no utiliza la API del backend** — toda la persistencia es vía `localStorage`.

---

## 🔌 Backend

Servidor Express con API REST funcional pero **no consumida por el frontend actual**:

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/greet?name=...` | GET | Saludo personalizado |
| `/api/todos` | GET | Listar tareas |
| `/api/todos` | POST | Crear tarea |
| `/api/todos/:id` | PUT | Actualizar tarea |
| `/api/todos/:id` | DELETE | Eliminar tarea |

- Puerto: `PORT` env var o 3001
- Almacenamiento: arreglo en memoria (no persiste entre reinicios)

---

## 🧩 Entidad `Todo`

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `id` | `Number` | — | Identificador único (auto-generado) |
| `title` | `String` | — | Título de la tarea (no vacío, trimmed) |
| `completed` | `Boolean` | `false` | Estado de completado |
| `createdAt` | `String` (ISO 8601) | `new Date().toISOString()` | Fecha de creación |

---

## 🧠 Decisiones Técnicas

| Decisión | Alternativa | Justificación |
|----------|-------------|---------------|
| **`localStorage`** en vez de IndexedDB | IndexedDB tiene más capacidad | Volumen esperado es bajo; API más simple. Migrar solo requiere cambiar el repositorio |
| **Clases** para casos de uso | Funciones puras | Permite inyección de dependencias por constructor para testing |
| **Composition Root separado** | Wirear en `index.js` | Mantiene desacoplada la configuración de dependencias |
| **Sin estado global** (Redux, Context) | Redux, Zustand | El estado es local al componente `App` — añadir una librería sería sobreingeniería |

---

## ⚠️ Notas Importantes

1. **Tres `package.json`**: raíz, `frontend/` y `backend/` — cada uno requiere su propio `npm install`.
2. **`frontend/` es un git submodule**: los cambios dentro de él deben committearse por separado.
3. **`ExportTodosPDF.execute(todos)`** recibe el arreglo de tareas directamente, no vía repositorio.
4. Los casos de uso reciben el repositorio por constructor: `new GetTodos(todoRepository)`.
5. No hay step de lint ni typecheck configurado.

---

## 📚 Documentación Adicional

- [`SDD.md`](./SDD.md) — Documento de Diseño de Software (en español, detalle arquitectónico completo)
- [`STACK.md`](./STACK.md) — Descripción del stack tecnológico (en inglés)
- [`AGENTS.md`](./AGENTS.md) — Instrucciones para asistentes de IA sobre convenciones del proyecto
- Frontend `README.md` — Documentación específica del submodule frontend
