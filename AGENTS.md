# Backend Agent Brief – Proyecto Jóvenes Creativos

## 1. Objetivo
Diseñar e implementar un backend (Node.js + Express recomendado) que provea una API REST para la aplicación React existente. El backend debe persistir datos en MongoDB y exponer endpoints para gestionar la colección de juegos consumida por el frontend actual.

## 2. Requisitos funcionales

### 2.1. Recursos expuestos
- **Games** (`/api/games`)
  - CRUD completo: listar, crear, obtener por id, actualizar, eliminar.
  - Debe retornar datos compatibles con `src/App.jsx`:
    ```json
    {
      "id": "string|number",
      "name": "string",
      "genre": "string",
      "cover": "string (URL)",
      "rating": "number (0–5)",
      "status": "string",
      "hoursPlayed": "number >= 0"
    }
    ```

### 2.2. Validaciones
- `name`, `genre`, `status`: obligatorios, longitud mínima 1.
- `cover`: URL válida.
- `rating`: número entre 0 y 5 (redondeo/limitación en backend).
- `hoursPlayed`: número entero >= 0.
- IDs deben ser únicos y estables (usar `_id` de MongoDB pero exponer como string).

### 2.3. Respuestas HTTP
- 200/201 para operaciones exitosas, 204 para DELETE sin body.
- 400 para validaciones fallidas (detallar campos).
- 404 para `GET/PUT/PATCH/DELETE /api/games/:id` inexistente.
- 500 para errores inesperados (log interno con stack).

## 3. Especificación de la API

| Método | Endpoint             | Descripción                       | Body esperado                    | Respuesta (200/201)          |
|--------|----------------------|-----------------------------------|----------------------------------|------------------------------|
| GET    | /api/games           | Lista todos los juegos            | —                                | `[{Game}]`                   |
| GET    | /api/games/:id       | Obtiene un juego por id           | —                                | `{Game}`                     |
| POST   | /api/games           | Crea un juego                     | `{ name, genre, cover, ... }`    | `{Game}`                     |
| PUT    | /api/games/:id       | Reemplaza un juego completo       | `{ name, genre, cover, ... }`    | `{Game}`                     |
| PATCH  | /api/games/:id       | Actualiza campos parciales        | `{ campos parciales }`           | `{Game}`                     |
| DELETE | /api/games/:id       | Elimina un juego                  | —                                | `204 No Content`             |

## 4. Arquitectura sugerida

- **Stack**: Node.js 20+, Express 4+, Mongoose 8+.
- **Estructura**:
  ```
  backend/
    src/
      index.ts|js          # arranque de servidor
      config/db.ts         # conexión Mongo
      models/Game.ts       # esquema Mongoose
      routes/games.ts      # definición de rutas
      controllers/games.ts # lógica CRUD
      middlewares/
        errorHandler.ts
        validateRequest.ts
  ```
- **Configuración**:
  - Variables en `.env`:
    ```
    PORT=4000
    MONGODB_URI=mongodb+srv://user:pass@cluster/db
    ```
  - Usar `dotenv` para cargarlas.
  - Habilitar CORS para `http://localhost:5173`.
  - Logging con `morgan` (modo dev) o equivalente.

## 5. MongoDB – Colecciones y documentos

### 5.1. Colección `games`
- **Nombre**: `games`
- **Índices**:
  - `{ name: 1 }` (opcional, para búsquedas alfabéticas)
  - `{ status: 1 }` (opcional, para estadísticas por estado)

### 5.2. Esquema Mongoose (TypeScript)
```typescript
import { Schema, model } from "mongoose";

const gameSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    cover: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    status: { type: String, required: true, trim: true },
    hoursPlayed: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

export default model("Game", gameSchema);
```

### 5.3. Documento de ejemplo
```json
{
  "_id": ObjectId("6760b20b5d572c2c8b6ad3a7"),
  "name": "Cyberpunk 2077",
  "genre": "Acción",
  "cover": "https://cdn.example.com/cyberpunk.webp",
  "rating": 4.5,
  "status": "Jugando",
  "hoursPlayed": 45,
  "createdAt": ISODate("2025-11-15T15:30:00Z"),
  "updatedAt": ISODate("2025-11-15T15:30:00Z")
}
```

## 6. Reglas de negocio

1. **Normalización**: Backend debe rechazar rating > 5 o < 0; horas negativas; URLs inválidas.
2. **Consistencia**: Los campos retornados deben coincidir exactamente con los usados en el frontend (`Stats`, `Library`, `Reviews`).
3. **Orden de datos**: Respetar orden original (`createdAt` ascendente) o permitir query param `?sort=updatedAt`.
4. **Estadísticas futuras**: Considerar endpoint adicional `/api/games/summary` que calcule totales por estado y horas acumuladas (usado por `Stats` si se externaliza).

## 7. Pasos recomendados para el agente

1. Inicializar proyecto backend (`npm init`, `tsconfig` opcional).
2. Instalar dependencias:
   ```
   npm install express mongoose cors morgan
   npm install -D typescript ts-node-dev @types/express @types/node
   ```
3. Configurar `tsconfig.json` (si se usa TS) y scripts en `package.json`.
4. Implementar `config/db.ts` para conectar a MongoDB y manejar reconexiones.
5. Crear modelo `Game` con esquema anterior.
6. Desarrollar rutas y controladores CRUD usando Mongoose.
7. Añadir middleware de validación (Joi/Zod o validaciones propias).
8. Configurar middleware global de errores y CORS.
9. Escribir pruebas básicas (Jest/Supertest) para endpoints críticos.
10. Documentar endpoints (OpenAPI/Swagger opcional).
11. Desplegar (Render, Railway, Vercel, etc.) y exponer `BASE_URL` al frontend.

## 8. Integración con frontend
- En `App.jsx`, cambiar `fetch` a `fetch("https://<backend>/api/games")`.
- Para crear/editar/eliminar:
  ```javascript
  async function addGame(newGame) {
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGame),
    });
    const created = await res.json();
    setGames(prev => [...prev, created]);
  }
  ```
- Manejar errores (toast/alert) cuando el backend devuelva 4xx/5xx.

## 9. Checklist de entrega
- [ ] Código fuente backend con instrucciones de ejecución.
- [ ] `.env.example` con variables necesarias.
- [ ] Scripts `npm run dev`, `npm run build`, `npm run start`.
- [ ] Colección de Postman/Insomnia opcional.
- [ ] Documentación resumida para el equipo frontend.
