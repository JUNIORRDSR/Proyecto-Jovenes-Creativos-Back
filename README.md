# Proyecto Jóvenes Creativos – Backend

API REST construida con Node.js, Express y MongoDB para gestionar el catálogo de reseñas de videojuegos consumido por el frontend existente.

## 🚀 Stack

- Node.js 20+
- Express 4+
- JavaScript (ESM) + nodemon en desarrollo
- MongoDB Atlas/local con Mongoose 8
- Validaciones con Zod y middlewares propios

## 🛠️ Configuración rápida

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env` y completa `PORT`, `MONGODB_URI`, `MONGODB_DB`, `CORS_ORIGINS`.
3. Levanta el servidor en desarrollo con `npm run dev`.
4. Para producción basta con `npm start` (no se requiere paso de build al ser JavaScript puro).
5. Ejecuta la suite de pruebas con `npm test`.

> Puedes apuntar a la base deseada añadiendo `/mi-base` al `MONGODB_URI` o definiendo `MONGODB_DB` (recomendado para Atlas clusters compartidos).

## 📦 Scripts disponibles

- `npm run dev` – servidor Express con recarga automática (nodemon).
- `npm run build` – placeholder para compatibilidad; no realiza transformaciones.
- `npm start` – ejecuta `src/index.js` en modo producción.
- `npm test` – corre Vitest + Supertest + Mongo Memory Server.
- `npm run test:watch` – modo interactivo de pruebas.
- `npm run db:update-validator` – actualiza el validador JSON Schema de la colección `games` en MongoDB (útil si se modifican reglas de validación).

## 📚 Endpoints principales

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/games` | Lista juegos (orden `createdAt` por defecto, soporta `?sort=updatedAt`) |
| GET | `/api/games/:id` | Obtiene juego por ID |
| POST | `/api/games` | Crea un juego validado |
| PUT | `/api/games/:id` | Reemplaza un juego completo |
| PATCH | `/api/games/:id` | Actualiza campos parciales |
| DELETE | `/api/games/:id` | Elimina un juego |
| GET | `/api/games/summary` | Totales y horas agrupadas por estado |

Todas las respuestas cumplen los códigos solicitados (200/201/204, 400/404/500). Los IDs expuestos usan `_id` de Mongo como `id` string y se devuelven `createdAt` / `updatedAt`.

## 🧪 Validaciones clave

- `name`, `genre`, `status`: obligatorios y con `trim`.
- `cover`: URL válida.
- `rating`: número 0-5 (el backend redondea a un decimal y limita el rango).
- `hoursPlayed`: entero mayor o igual que 0.

## 📄 Salud y monitoreo

- `GET /health` expone el estado básico del servicio.
- Logging HTTP con `morgan` modo `dev`.

## 📂 Estructura sugerida

```text
src/
  config/db.js
  controllers/game.controller.js
  index.js
  middlewares/
  models/
  routes/
  validators/
```

## ✅ Checklist de entrega

- [x] API CRUD + summary.
- [x] Validaciones exhaustivas + normalización rating/horas.
- [x] Scripts `dev`, `build`, `start`, `test`.
- [x] `.env.example` documentado.
- [x] Pruebas base con Supertest.
