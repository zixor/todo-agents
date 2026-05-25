---
name: frontend-cr
description: Skill para reemplazar elementos HTML primitivos por componentes React reutilizables en el frontend del proyecto.
---

## Cuándo Usar

Usa este skill cuando el usuario pida refactorizar un archivo del frontend para sustituir etiquetas HTML nativas por componentes React reutilizables del proyecto.

## Pasos

### 1. Leer el archivo objetivo

Si el usuario ya indicó el archivo, léelo directamente. Si no lo indicó, pregúntale:

> "¿Qué archivo quieres refactorizar?"

El path debe ser relativo a `frontend/src/` (ej: `presentation/components/App.js`).

### 2. Escanear elementos HTML primitivos

Lee el contenido completo del archivo. Identifica TODAS las ocurrencias de estas etiquetas HTML nativas y su contexto de uso (props, children, eventos):

| HTML nativo | Componente sustituto |
|---|---|
| `<button>` | `Button` |
| `<input type="text"...>` | `Input` |
| `<input type="checkbox"...>` | `Checkbox` |
| `<form>` | `Form` |
| `<h1>` a `<h6>` | `Heading` |
| `<p>` | `Text` |
| `<ul>` / `<li>` | `List` / `ListItem` |
| `<span>` | `Text` |

Para cada ocurrencia, anota:
- Línea donde aparece
- Atributos/props que usa (className, onClick, onChange, value, placeholder, etc.)
- Contenido children si aplica
- Event handlers asociados

### 3. Buscar componentes existentes

Busca en `frontend/src/presentation/components/` usando Glob:

```
frontend/src/presentation/components/<Nombre>.js
```

Por ejemplo, para `<button>` busca `frontend/src/presentation/components/Button.js`.

Para `<ul>` busca `frontend/src/presentation/components/List.js` y `frontend/src/presentation/components/ListItem.js`.

Para `<span>` y `<p>` busca `frontend/src/presentation/components/Text.js`.

Lee el componente encontrado para analizar su interfaz (props que acepta).

### 4. Evaluar adaptación del componente existente

**Si el componente NO existe** → salta al paso 5.

**Si el componente SÍ existe**, compara sus props contra lo que necesita el HTML primitivo:

- **Caso A — Adaptación completa**: Las props del componente cubren exactamente el uso (mismos nombres de props, mismos tipos). → Reemplaza directamente (paso 6).

- **Caso B — Adaptación parcial**: El componente existe pero le faltan props, o los nombres no coinciden, o necesita cambios. → Crea una **propuesta de refactorización** describiendo:
  - Qué props agregar/modificar
  - Cómo cambiar la interfaz del componente
  - Impacto en otros archivos que ya lo usan
  - Propuesta de código con los cambios

  Detente y preséntale la propuesta al usuario preguntando si quiere proceder con la refactorización antes de continuar.

### 5. Crear el componente (si no existe)

Crea el archivo en `frontend/src/presentation/components/<Nombre>.js`.

Sigue estas convenciones:

```jsx
import React from 'react';

function Nombre({ prop1, prop2, children, ...props }) {
  return (
    <nativa-etiqueta className={`nombre-clase ${props.className || ''}`} {...props}>
      {children}
    </nativa-etiqueta>
  );
}

export default Nombre;
```

Reglas:
- Componente funcional, sin estado local
- Usa `className` para estilos (los estilos pueden ir en `src/App.css` o en un archivo `<Nombre>.css` en el mismo directorio)
- Props con nombres claros y valores por defecto sensatos
- Soporta `children` y `...rest` para flexibilidad
- Extiende `className` si el padre pasa una clase adicional
- Sigue el mismo patrón que `App.js`

### 6. Reemplazar los primitivos por los componentes

Para cada ocurrencia identificada en paso 2:

1. Sustituye la etiqueta HTML por el componente JSX correspondiente
2. Agrega el import al inicio del archivo:

```js
import Button from '../components/Button.js';
```

Ajusta el path relative según donde esté el archivo que estás editando:
- Si el archivo está en `presentation/components/`, el import es `./Button.js`
- Si el archivo está en otro lado, calcula el path relativo correcto

### 7. Verificar

Vuelve a leer el archivo modificado y confirma que no queden etiquetas HTML primitivas de las listadas en paso 2 (excepto las que deliberadamente se dejaron como HTML nativo porque no aplicaba el reemplazo).

## Convenciones del Proyecto

- Todos los imports usan extensión `.js` explícita
- Componentes funcionales de React (no clases)
- El estado global se maneja con Zustand (`useTodoStore` en `presentation/store/`)
- Los estilos están en `src/App.css` (archivo único)
- Mensajes de error en **español**
