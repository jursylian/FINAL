# Архитектура backend

Навигация: [README.md](README.md) → [04-database-models.md](04-database-models.md) → [05-api-spec.md](05-api-spec.md)

## Структура папок

```
backend/
├── src/
│   ├── app.js              # Express приложение, middleware, роуты
│   ├── server.js           # Точка входа, подключение к БД
│   ├── controllers/        # Бизнес-логика
│   │   ├── authController.js
│   │   ├── usersController.js
│   │   ├── postsController.js
│   │   ├── commentsController.js
│   │   ├── likesController.js
│   │   ├── followController.js
│   │   ├── notificationsController.js
│   │   ├── searchController.js
│   │   └── exploreController.js
│   ├── models/             # Mongoose схемы
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Like.js
│   │   ├── Comment.js
│   │   ├── Follow.js
│   │   ├── Notification.js
│   │   └── Message.js      # Опционально (для чата)
│   ├── routes/             # Express роуты
│   │   ├── authRoutes.js
│   │   ├── usersRoutes.js
│   │   ├── postsRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── exploreRoutes.js
│   │   ├── feedRoutes.js
│   │   └── notificationsRoutes.js
│   ├── middlewares/        # Middleware
│   │   ├── auth.js         # JWT проверка (обязательная)
│   │   ├── optionalAuth.js # JWT проверка (опциональная)
│   │   └── upload.js       # Multer для загрузки файлов
│   └── utils/              # Переиспользуемые утилиты
│       ├── db.js           # Подключение к MongoDB
│       ├── pagination.js   # Парсинг параметров пагинации
│       ├── errorHandler.js # Унифицированная обработка ошибок
│       ├── objectId.js     # Конвертация в ObjectId
│       ├── publicUser.js   # Удаление пароля из ответа
│       └── followingIds.js # Получение списка подписок
├── .env                    # Переменные окружения
└── package.json
```

## Паттерн Routes → Controllers → Models

- **Routes** — описывают URL, HTTP методы, подключают middleware
- **Controllers** — содержат бизнес-логику, обращаются к моделям
- **Models** — Mongoose схемы с валидацией
- **Middlewares** — сквозные задачи: аутентификация, загрузка файлов
- **Utils** — переиспользуемые функции

## Утилиты (utils/)

| Файл | Функция | Описание |
|------|---------|----------|
| `pagination.js` | `parsePagination(query, defaultLimit)` | Парсит page/limit из query string |
| `errorHandler.js` | `handleError(err, res)` | Унифицированная обработка ошибок |
| `objectId.js` | `toObjectId(value)` | Безопасная конвертация в ObjectId |
| `publicUser.js` | `toPublicUser(userDoc)` | Удаляет password и reset-токены |
| `followingIds.js` | `getFollowingIds(userId)` | Возвращает массив ID подписок |

## Обработка ошибок

Все контроллеры используют унифицированный обработчик:

```javascript
import { handleError } from "../utils/errorHandler.js";

// В контроллере:
try {
  // логика
} catch (err) {
  return handleError(err, res);
}
```

Коды ошибок:
- `400` — валидация
- `401` — нет токена / невалидный токен
- `403` — нет прав
- `404` — не найдено
- `409` — конфликт (duplicate)
- `500` — внутренняя ошибка

Формат ответа:
```json
{ "message": "Error description", "details": {} }
```

## Auth Middleware

### auth.js (обязательная авторизация)
- Читает `Authorization: Bearer <token>`
- Валидирует JWT
- Записывает `req.userId`
- При ошибке — 401

### optionalAuth.js (опциональная авторизация)
- Если токен есть — валидирует и записывает `req.userId`
- Если токена нет — продолжает без userId
- При невалидном токене — 401

## Загрузка изображений

### Текущая реализация (Base64)

```javascript
// middlewares/upload.js
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// В контроллере:
const mimeType = req.file.mimetype || "image/jpeg";
const base64 = req.file.buffer.toString("base64");
const dataUrl = `data:${mimeType};base64,${base64}`;
```

**Особенности:**
- Файл хранится в памяти (memoryStorage)
- Конвертируется в Base64 Data URL
- Сохраняется как строка в MongoDB
- Лимит: 5MB на файл

**Ограничения для production:**
- +33% к размеру файла
- Нагрузка на БД
- Лимит документа MongoDB: 16MB
- Нет CDN кеширования

**Альтернативы для production:**
- Cloudinary
- AWS S3 / DigitalOcean Spaces
- Локальное файловое хранилище

## Защита данных

- Пароль никогда не возвращается: `toPublicUser()` или `.select('-password')`
- Reset-токены удаляются из ответа
- Email скрывается для не-владельцев профиля

## CORS

```javascript
cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
})
```

Для production — указать реальный домен frontend.
