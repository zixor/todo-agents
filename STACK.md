# Technology Stack

This project utilizes **JavaScript** as the primary language, applying **Clean Architecture** and **SOLID principles** to separate concerns into distinct layers.

## Architecture

### Clean Architecture Layers

- **Domain Layer:** Enterprise business rules. Defines the `Todo` entity and the `TodoRepository` port (interface) independent of frameworks.
- **Application Layer:** Application-specific use cases (`GetTodos`, `CreateTodo`, `UpdateTodo`, `DeleteTodo`, `ExportTodosPDF`). Each use case is a **Command** class with an `execute()` method.
- **Infrastructure Layer:** Implements adapters for external concerns. `LocalStorageTodoRepository` persists data via the browser's `localStorage` API. `TodoMapper` converts between domain entities and persistence format (**Mapper pattern**).
- **Presentation Layer:** React components that render the UI and delegate all business logic to use cases.

### Design Patterns

- **Repository Pattern:** `TodoRepository` abstract port with `LocalStorageTodoRepository` concrete implementation.
- **Dependency Injection:** Use cases receive their dependencies via constructor. `di.js` acts as the **Composition Root**, wiring all dependencies at the application entry point.
- **Command Pattern:** Each use case encapsulates a single operation behind a uniform `execute()` interface.
- **Mapper Pattern:** `TodoMapper` separates domain entity representation from the persistence schema.

## Frontend

- **React:** For building the user interface and managing client-side state.
- **jsPDF & jspdf-autotable:** For client-side PDF generation and export of task lists.

## Storage

- **localStorage:** In-memory persistence using the browser's built-in key-value database. No external database or backend server required.

## Project Structure

```
src/
├── domain/
│   ├── entities/
│   │   └── Todo.js
│   └── repositories/
│       └── TodoRepository.js
├── application/
│   └── use-cases/
│       ├── GetTodos.js
│       ├── CreateTodo.js
│       ├── UpdateTodo.js
│       ├── DeleteTodo.js
│       └── ExportTodosPDF.js
├── infrastructure/
│   └── repositories/
│       ├── TodoMapper.js
│       └── LocalStorageTodoRepository.js
├── presentation/
│   └── components/
│       ├── App.js
│       └── App.css
├── di.js
└── index.js
```

## Features

- **Todo CRUD:** Full Create, Read, Update, Delete operations for tasks via clean use cases.
- **PDF Export:** Export the task list to a formatted PDF document with table layout.
- **Clean Architecture:** Separation of concerns across domain, application, infrastructure, and presentation layers.
- **Design Patterns:** Repository, Dependency Injection, Command, and Mapper.
