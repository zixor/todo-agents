# Software Design Document (SDD) — Todo App

## 1. Introducción

### 1.1 Propósito
Este documento describe el diseño arquitectónico y de detalle de la aplicación Todo App, una herramienta web para la gestión de tareas personales con capacidad de exportación a PDF.

### 1.2 Alcance
Aplicación frontend React con arquitectura limpia (Clean Architecture), almacenamiento en `localStorage` del navegador y cero dependencia de servidor backend.

### 1.3 Definiciones y Acrónimos
| Término | Descripción |
|---------|-------------|
| Clean Architecture | Arquitectura en capas propuesta por Robert C. Martin que separa dominio, aplicación, infraestructura y presentación. |
| DI | Dependency Injection — inyección de dependencias. |
| Repository | Patrón que abstrae el acceso a datos detrás de una interfaz. |
| Use Case | Caso de uso — unidad atómica de lógica de aplicación. |
| Composition Root | Punto único de ensamblaje de dependencias. |

---

## 2. Requisitos

### 2.1 Requisitos Funcionales

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | El usuario debe poder crear una tarea con un título | Alta |
| RF-02 | El usuario debe poder marcar/desmarcar una tarea como completada | Alta |
| RF-03 | El usuario debe poder editar el título de una tarea existente | Alta |
| RF-04 | El usuario debe poder eliminar una tarea | Alta |
| RF-05 | El usuario debe poder ver la lista completa de tareas | Alta |
| RF-06 | El usuario debe poder exportar la lista de tareas a PDF | Media |
| RF-07 | Los datos deben persistir entre recargas del navegador | Alta |
| RF-08 | El sistema debe validar que el título de la tarea no esté vacío | Alta |
| RF-09 | El sistema debe mostrar mensajes de error ante fallos de operación | Media |

### 2.2 Requisitos No Funcionales

| ID | Descripción | Categoría |
|----|-------------|-----------|
| RNF-01 | Almacenamiento 100 % en el navegador sin servidor backend | Arquitectura |
| RNF-02 | Separación en capas siguiendo Clean Architecture | Mantenibilidad |
| RNF-03 | Las dependencias deben apuntar hacia el dominio (Regla de Dependencia) | Arquitectura |
| RNF-04 | La interfaz de usuario debe funcionar sin conexión a internet | Disponibilidad |
| RNF-05 | El código debe ser testeable mediante inyección de dependencias | Testeabilidad |

---

## 3. User Stories y Tasks

### 3.1 Épicas y User Stories

| ID | Épica | User Story | Criterios de Aceptación |
|----|-------|------------|--------------------------|
| US-01 | Gestión de tareas | Como usuario, quiero crear tareas para recordar mis pendientes | Poder escribir un título y verlo en la lista |
| US-02 | Gestión de tareas | Como usuario, quiero marcar tareas como completadas para trackear mi progreso | Click en checkbox cambia el estado visual y persiste |
| US-03 | Gestión de tareas | Como usuario, quiero editar tareas para corregir errores | Doble click o botón Editar permite cambiar el título |
| US-04 | Gestión de tareas | Como usuario, quiero eliminar tareas que ya no son relevantes | Botón Eliminar remueve la tarea de la lista y del storage |
| US-05 | Exportación | Como usuario, quiero exportar mis tareas a PDF para compartirlas | Click en "Exportar PDF" descarga un archivo con la lista formateada |
| US-06 | Persistencia | Como usuario, quiero que mis tareas sigan ahí al recargar la página | Los datos se guardan en localStorage y se recuperan al iniciar |

### 3.2 Tasks Técnicas

| ID | Task | Dependencia | Estado |
|----|------|-------------|--------|
| T-01 | Diseñar e implementar la entidad `Todo` en la capa de dominio | — | Implementado |
| T-02 | Definir el puerto `TodoRepository` con los métodos del contrato | T-01 | Implementado |
| T-03 | Implementar `TodoMapper` para conversión dominio-persistencia | T-01 | Implementado |
| T-04 | Implementar `LocalStorageTodoRepository` con CRUD completo | T-02, T-03 | Implementado |
| T-05 | Implementar casos de uso: `GetTodos`, `CreateTodo`, `UpdateTodo`, `DeleteTodo` | T-02 | Implementado |
| T-06 | Implementar caso de uso `ExportTodosPDF` con jsPDF | — | Implementado |
| T-07 | Configurar Composition Root (`di.js`) con inyección de dependencias | T-04, T-05, T-06 | Implementado |
| T-08 | Construir interfaz de usuario React en `presentation/components/App.js` | T-07 | Implementado |
| T-09 | Escribir pruebas unitarias para casos de uso y mapper | T-05, T-03 | Pendiente |
| T-10 | Escribir pruebas de integración para repositorio y componente App | T-04, T-08 | Pendiente |

---

## 4. Arquitectura General

### 4.1 Estilo Arquitectónico
Clean Architecture con 4 capas, siguiendo la Regla de Dependencia: las dependencias apuntan hacia adentro (dominio no depende de nada).

```
src/
├── domain/            ← Capa más interna (sin dependencias)
├── application/       ← Depende solo de domain
├── infrastructure/    ← Depende de domain
├── presentation/      ← Depende de application e infrastructure
└── di.js              ← Composition Root (ensambla todo)
```

### 4.2 Diagrama de Capas y Flujo de Datos

```
[Usuario]
    │
    ▼
┌─────────────────────────────────┐
│  Presentation (React Component) │
│  └── App.js                     │
└──────────┬──────────────────────┘
           │ llama a execute()
           ▼
┌─────────────────────────────────┐
│  Application (Use Cases)        │
│  ├── GetTodos                   │
│  ├── CreateTodo                 │
│  ├── UpdateTodo                 │
│  ├── DeleteTodo                 │
│  └── ExportTodosPDF             │
└──────────┬──────────────────────┘
           │ opera sobre entidad
           ▼
┌─────────────────────────────────┐
│  Domain (Entities & Ports)      │
│  ├── Todo (entidad)             │
│  └── TodoRepository (puerto)    │
└──────────┬──────────────────────┘
           │ implementa
           ▼
┌─────────────────────────────────┐
│  Infrastructure (Repositories)  │
│  ├── LocalStorageTodoRepository │
│  └── TodoMapper                 │
└──────────┬──────────────────────┘
           │ persiste en
           ▼
┌─────────────────────────────────┐
│  localStorage (Browser API)     │
└─────────────────────────────────┘
```

### 4.3 Composition Root (`di.js`)

Único punto de ensamblaje. Instancia el repositorio concreto y lo inyecta en cada caso de uso vía constructor:

```
LocalStorageTodoRepository
    ├──► GetTodos(repository)
    ├──► CreateTodo(repository)
    ├──► UpdateTodo(repository)
    ├──► DeleteTodo(repository)
    └──► ExportTodosPDF (no recibe repositorio)
```

---

## 5. Diseño de Componentes por Capa

### 5.1 Capa de Dominio

#### Entidad `Todo`
| Propiedad | Tipo | Default | Restricciones |
|-----------|------|---------|---------------|
| `id` | Number | — | Generado automáticamente, único |
| `title` | String | — | No vacío, trimmed |
| `completed` | Boolean | `false` | — |
| `createdAt` | ISO 8601 String | `new Date().toISOString()` | — |

#### Puerto `TodoRepository`
Define el contrato que cualquier repositorio debe implementar:

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `getAll()` | `Promise<Todo[]>` | Retorna todas las tareas |
| `save(todo)` | `Promise<Todo>` | Persiste una nueva tarea |
| `update(todo)` | `Promise<Todo>` | Actualiza una tarea existente |
| `delete(id)` | `Promise<void>` | Elimina una tarea por ID |
| `nextId()` | `Number` | Genera el siguiente ID disponible |

### 5.2 Capa de Aplicación (Use Cases)

Cada caso de uso es una clase con un método `execute()`. Recibe el repositorio por constructor (DI).

| Use Case | Método | Validaciones | Efectos Secundarios |
|----------|--------|--------------|-------------------|
| `GetTodos` | `execute()` | — | Lectura de datos |
| `CreateTodo` | `execute({ title })` | `title` requerido y no vacío | Escritura en repositorio |
| `UpdateTodo` | `execute(id, updates)` | `id` debe existir en repositorio | Escritura en repositorio |
| `DeleteTodo` | `execute(id)` | — | Eliminación en repositorio |
| `ExportTodosPDF` | `execute(todos)` | — | Genera y descarga PDF (jsPDF) |

### 5.3 Capa de Infraestructura

#### `LocalStorageTodoRepository`
- **Key en localStorage:** `"todos"`
- **Formato:** JSON array de objetos planos
- **ID generator:** `Math.max(...existingIds) + 1`
- Implementa todos los métodos del puerto `TodoRepository`

#### `TodoMapper`
| Método | Entrada | Salida |
|--------|---------|--------|
| `toDomain(raw)` | Objeto plano del storage | Instancia de `Todo` |
| `toPersistence(todo)` | Instancia de `Todo` | Objeto plano para storage |

### 5.4 Capa de Presentación

#### Componente `App` (React)
| Estado | Tipo | Propósito |
|--------|------|-----------|
| `todos` | `Todo[]` | Lista actual de tareas |
| `newTitle` | String | Valor del input de nueva tarea |
| `editId` | Number \| null | ID de la tarea en edición |
| `editTitle` | String | Valor del input de edición |
| `error` | String | Mensaje de error a mostrar |

**Handlers:**
- `loadTodos()` → `getTodos.execute()`
- `handleAdd(e)` → `createTodo.execute({ title })`
- `handleToggle(todo)` → `updateTodo.execute(id, { completed })`
- `handleEditSubmit(e)` → `updateTodo.execute(id, { title })`
- `handleDelete(id)` → `deleteTodo.execute(id)`
- `handleExportPDF()` → `exportTodosPDF.execute(todos)`

---

## 6. Patrones de Diseño

| Patrón | Aplicación | Beneficio |
|--------|-----------|-----------|
| **Repository** | `TodoRepository` como interfaz, `LocalStorageTodoRepository` como implementación concreta | Aisla la lógica de negocio de la tecnología de persistencia. Permite cambiar localStorage por IndexedDB, API REST, etc. sin modificar dominio ni aplicación. |
| **Dependency Injection** | Los casos de uso reciben el repositorio vía constructor | Desacoplamiento total. Facilita testing (mock del repositorio). |
| **Command** | Cada caso de uso expone `execute()` como interfaz uniforme | Cada operación es un objeto independiente, fácil de testear, extender o componer. |
| **Mapper** | `TodoMapper` con métodos estáticos `toDomain` / `toPersistence` | Separa la representación de dominio del formato de persistencia. |
| **Composition Root** | `di.js` centraliza toda la creación y wireado de objetos | Garantiza que ninguna clase busque sus propias dependencias. |

---

## 7. Flujo de Datos

### 7.1 Creación de Tarea
```
Usuario escribe título → click "Agregar"
    │
    ▼
App.handleAdd(e)
    │  e.preventDefault()
    │  valida newTitle.trim()
    ▼
CreateTodo.execute({ title })
    │  new Todo({ id: nextId++, title })
    │  TodoRepository.save(todo)
    ▼
LocalStorageTodoRepository.save()
    │  TodoMapper.toPersistence(todo)
    │  localStorage.setItem("todos", JSON.stringify([...]))
    ▼
Retorna Todo a App → setTodos([...todos, todo])
```

### 7.2 Exportación PDF
```
Usuario click "Exportar PDF"
    │
    ▼
App.handleExportPDF()
    │
    ▼
ExportTodosPDF.execute(todos)
    │  new jsPDF()
    │  autoTable(doc, { head, body })
    │  doc.save("tareas.pdf")
    ▼
Descarga del archivo PDF
```

---

## 8. Decisiones de Diseño

| Decisión | Alternativa | Razón |
|----------|-------------|-------|
| `localStorage` vs IndexedDB | IndexedDB ofrece más capacidad y consultas estructuradas | `localStorage` es suficiente para el volumen esperado (tareas personales), API síncrona más simple. Migrar a IndexedDB solo requiere cambiar `LocalStorageTodoRepository`. |
| Clases vs funciones para use cases | Funciones simples | Las clases permiten inyección de dependencias por constructor, facilitando testing y extensibilidad futura. |
| Composition Root separado vs en index.js | Colocar el wiring en index.js | Mantener `di.js` separado permite cambiar la configuración de dependencias sin tocar la entrada de la aplicación. |
| Sin librería de estado global | Redux, Zustand, Context API | El estado es local al componente `App` y no se comparte. Agregar una librería sería sobreingeniería. |

---

## 9. Dependencias Externas

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| react | ^19.2.6 | UI Framework |
| react-dom | ^19.2.6 | Renderizado DOM |
| jspdf | ^4.2.1 | Generación de PDF |
| jspdf-autotable | ^5.0.8 | Tablas en PDF |
| react-scripts | 5.0.1 | Build y tooling |
| @testing-library/react | ^16.3.2 | Testing de componentes |

---

## 10. Estrategia de Pruebas

### 10.1 Pruebas Unitarias
- **Use Cases:** Mock del repositorio, verificar que `execute()` llama a los métodos correctos del repositorio y aplica validaciones.
- **Mapper:** Verificar conversión correcta entre dominio y persistencia.
- **Entidad Todo:** Verificar valores por defecto y constructor.

### 10.2 Pruebas de Integración
- **LocalStorageTodoRepository:** Usar un mock de `localStorage` para verificar CRUD completo.
- **Componente App:** Renderizar con el repository real o mock, verificar flujos de UI.

### 10.3 Pruebas de UI (actual)
- Test existente en `App.test.js` verifica que el título "Todo App" se renderiza correctamente.
- jsPDF y jspdf-autotable están mockeados para evitar errores de entorno Node.js.

---

## 11. Seguridad

- No se almacenan datos sensibles ni credenciales.
- `localStorage` está limitado al mismo origen (same-origin policy).
- No hay comunicación con servidores externos.

---

## 12. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Pérdida de datos por limpieza de localStorage | Alto | Documentar al usuario que los datos son locales. En futura versión agregar export/import JSON. |
| Límite de 5-10 MB en localStorage | Bajo | Implementar compresión o migrar a IndexedDB si se acerca al límite. |
| jsPDF no disponible en entorno test | Medio | Mock de la librería en tests. Refactorizar para lazy import si persiste. |
