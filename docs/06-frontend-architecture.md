# Архитектура frontend

Навигация: [README.md](README.md) → [05-api-spec.md](05-api-spec.md) → [07-feature-guides.md](07-feature-guides.md)

## Страницы и маршруты (пример)
- `/register` — регистрация
- `/login` — логин
- `/feed` — лента
- `/post/:id` — страница поста
- `/profile/:id` — профиль
- `/profile/:id/edit` — редактирование профиля
- `/explore` — explore
- `/search` — поиск
- `/notifications` — уведомления
- `/chat` — чат (опционально)

## Protected routes
- Доступны только при наличии токена.
- При отсутствии токена — редирект на `/login`.

## Работа с токеном
Рекомендации:
- Учебный вариант: хранить токен в `localStorage`.
- Безопаснее: хранить в памяти и восстанавливать с помощью `/auth/me`.
- Всегда передавать `Authorization: Bearer <token>`.

## API‑клиент
- Единая обертка над `fetch`/`axios`.
- Автоматическая подстановка заголовка `Authorization`.
- Унифицированная обработка ошибок 400/401/403/409.

## Загрузка изображений
- Использовать `FormData` и поле `image`.
- Не устанавливать `Content‑Type` вручную — браузер выставит сам.

## State management
- Минимум: `AuthContext` + `useState`/`useReducer`.
- Дополнительно: React Query/Redux для ленты и кеша.

