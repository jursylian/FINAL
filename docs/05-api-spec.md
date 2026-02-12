# Спецификация REST API

Навигация: [README.md](README.md) → [06-frontend-architecture.md](06-frontend-architecture.md)

Базовый URL: `/api`

## Общие правила
- Аутентификация: `Authorization: Bearer <token>`
- Успешные ответы: JSON с данными
- Ошибка: JSON `{ message, code, details }`
- Изображения: `multipart/form-data` + поле `image`
- Пароль не возвращается (использовать `.select('-password')`)

## Auth

### POST `/auth/register`
Описание: регистрация пользователя.

Body (JSON):
- `email` (string, required)
- `username` (string, required)
- `password` (string, required)
- `name` (string, optional)

Ответ 201:
- `token` (string)
- `user` (объект пользователя без `password`)

Ошибки:
- 400: валидация
- 409: email/username уже заняты

### POST `/auth/login`
Описание: логин.

Body (JSON):
- `email` (string, optional)
- `username` (string, optional)
- `password` (string, required)

Ответ 200:
- `token`
- `user` (без `password`)

Ошибки:
- 400: неверные данные
- 401: неверный пароль

### GET `/auth/me`
Описание: текущий профиль (защищенный).

Headers:
- `Authorization: Bearer <token>`

Ответ 200:
- `user` (без `password`)

Ошибки:
- 401: нет/невалидный токен

### POST `/auth/forgot-password`
Описание: запрос на сброс пароля.

Body (JSON):
- `identifier` (string, required) — email или username

Ответ 200:
- `message` (string)

Ошибки:
- 400: валидация

Примечание: всегда возвращает успех для предотвращения утечки информации о пользователях.

### POST `/auth/reset-password`
Описание: установка нового пароля по токену.

Body (JSON):
- `token` (string, required) — токен из письма
- `password` (string, required) — новый пароль

Ответ 200:
- `message` (string)

Ошибки:
- 400: невалидный или истёкший токен
- 400: валидация пароля

## Users / Profile

### GET `/users/:id`
Описание: получить профиль по id.

Ответ 200:
- `user` (без `password`)

Ошибки:
- 404: не найден

### PATCH `/users/:id`
Описание: обновить профиль (только владелец).

Headers:
- `Authorization`

Body (JSON):
- `name`, `bio`, `website`, `username`, `email` (опционально)

Ответ 200:
- `user` (без `password`)

Ошибки:
- 400: валидация
- 401/403: нет прав
- 409: конфликт уникальности

### PATCH `/users/:id/avatar`
Описание: обновить аватар.

Headers:
- `Authorization`
Content‑Type:
- `multipart/form-data`

FormData:
- `image` (file, required)

Ответ 200:
- `user` (с новым `avatar`)

Ошибки:
- 400: неверный файл
- 401/403: нет прав

### GET `/users/:id/posts`
Описание: посты пользователя.

Query:
- `page`, `limit` (опционально)

Ответ 200:
- `items`, `page`, `limit`, `total`

## Posts

### POST `/posts`
Описание: создать пост.

Headers:
- `Authorization`
Content‑Type:
- `multipart/form-data`

FormData:
- `image` (file, required)
- `caption` (string, optional)

Ответ 201:
- `post`

Ошибки:
- 400: валидация/файл
- 401: нет токена

### GET `/posts`
Описание: лента постов (например, по подпискам).

Query:
- `page`, `limit`

Ответ 200:
- `items`, `page`, `limit`, `total`

### GET `/posts/:id`
Описание: детальная информация о посте.

Ответ 200:
- `post`

### PATCH `/posts/:id`
Описание: обновить подпись поста (владелец).

Body (JSON):
- `caption`

Ответ 200:
- `post`

### DELETE `/posts/:id`
Описание: удалить пост (владелец).

Ответ 204: без тела

Ошибки:
- 401/403: нет прав
- 404: пост не найден

## Likes

### POST `/posts/:id/like`
Описание: toggle like (если есть — удалить, иначе создать).

Headers:
- `Authorization`

Ответ 200:
- `liked` (boolean)
- `likesCount` (number)

Ошибки:
- 401: нет токена
- 404: пост не найден

Примечание: запрет дублей обеспечен индексом `{ userId, postId }`.

## Comments

### POST `/posts/:id/comments`
Описание: добавить комментарий.

Headers:
- `Authorization`

Body (JSON):
- `text` (string, required)

Ответ 201:
- `comment`

Ошибки:
- 400: валидация
- 401: нет токена

### GET `/posts/:id/comments`
Описание: список комментариев.

Query:
- `page`, `limit`

Ответ 200:
- `items`, `page`, `limit`, `total`

## Feed

### GET `/feed/home`
Описание: лента постов от подписок (отдельный роут).

Headers:
- `Authorization`

Query:
- `page`, `limit` (опционально)

Ответ 200:
- `items`, `page`, `limit`, `total`

### GET `/feed/explore`
Описание: лента explore-постов (отдельный роут).

Headers:
- `Authorization` (опционально, через optionalAuth)

Query:
- `page`, `limit` (опционально)

Ответ 200:
- `items`, `page`, `limit`, `total`

## Comment Likes

### POST `/comments/:commentId/like`
Описание: toggle like на комментарий.

Headers:
- `Authorization`

Ответ 200:
- `liked` (boolean)
- `likesCount` (number)

## Search

### GET `/search/users`
Описание: поиск пользователей по `username`/`name`.

Query:
- `q` (string, required)

Ответ 200:
- `items` (массив пользователей без `password`)

## Explore

### GET `/explore/posts`
Описание: случайные посты для explore.

Query:
- `limit` (опционально)

Ответ 200:
- `items`

Примечание: для случайной выборки можно использовать `aggregate([{ $sample: { size: ... } }])`.

## Follow

### POST `/users/:id/follow`
Описание: follow/unfollow.

Headers:
- `Authorization`

Ответ 200:
- `following` (boolean)

Ошибки:
- 401: нет токена
- 404: пользователь не найден

### GET `/users/:id/followers`
Описание: список подписчиков.

Ответ 200:
- `items`

### GET `/users/:id/following`
Описание: список подписок.

Ответ 200:
- `items`

## Notifications

### GET `/notifications`
Описание: список уведомлений пользователя.

Headers:
- `Authorization`

Query:
- `unread` (boolean, опционально)

Ответ 200:
- `items`

### GET `/notifications/unread-count`
Описание: количество непрочитанных уведомлений.

Headers:
- `Authorization`

Ответ 200:
- `count` (number)

### PATCH `/notifications/:id/read`
Описание: пометить уведомление как прочитанное.

Headers:
- `Authorization`

Ответ 200:
- `notification`

Ошибки:
- 401: нет токена
- 404: не найдено

### DELETE `/notifications/:id`
Описание: удалить уведомление.

Headers:
- `Authorization`

Ответ 200/204: удалено

Ошибки:
- 401: нет токена
- 404: не найдено

## Health

### GET `/api/health`
Описание: проверка работоспособности сервера.

Ответ 200:
- `{ "status": "ok" }`

