# Архитектура backend

Навигация: [README.md](README.md) → [04-database-models.md](04-database-models.md) → [05-api-spec.md](05-api-spec.md)

## Структура папок (рекомендация)
```
backend/
  src/
    app.js
    server.js
    config/
      db.js
    models/
      User.js
      Post.js
      Like.js
      Comment.js
      Follow.js
      Notification.js
      Message.js (опционально)
    controllers/
      auth.controller.js
      users.controller.js
      posts.controller.js
      comments.controller.js
      notifications.controller.js
      follow.controller.js
      search.controller.js
    routes/
      auth.routes.js
      users.routes.js
      posts.routes.js
      search.routes.js
      explore.routes.js
      notifications.routes.js
    middlewares/
      auth.js
      errorHandler.js
      upload.js
    utils/
      jwt.js
      hash.js
      validators.js
```

## Паттерн controllers / routes / middlewares
- `routes` описывают URL и методы.
- `controllers` содержат бизнес‑логику, обращаются к моделям.
- `middlewares` решают сквозные задачи: auth, ошибки, загрузки.

## Обработка ошибок
- Ошибки из контроллеров передаются через `next(err)`.
- Единый error‑handler формирует JSON:
  - `{ message, code, details }`
- Коды ошибок: 400 (валидация), 401 (нет токена), 403 (нет прав), 404 (не найдено), 409 (конфликт), 500 (сервер).

## Auth middleware
- Читает `Authorization: Bearer <token>`.
- Валидирует JWT и прикладывает `req.user`.
- При ошибке — 401.

## Загрузка изображений
- Multer `memoryStorage`, без записи на диск.
- Файл конвертируется в base64 и сохраняется как data URL:
  - `data:image/<ext>;base64,<...>`
- Frontend отправляет через `FormData` с полем `image`.

## Защита данных
- При выдаче профиля исключать пароль: `.select('-password')`.
- В логах и ответах не использовать хэш пароля.

