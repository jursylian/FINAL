# Установка и запуск

Навигация: [README.md](README.md) → [00-overview.md](00-overview.md) → [02-phases.md](02-phases.md)

## Предварительные требования
- Node.js LTS
- MongoDB (локально или облачно)
- npm/yarn/pnpm (любой один)

## Установка зависимостей
1. Перейти в `backend/` и установить зависимости.
2. Перейти в `frontend/` и установить зависимости.

## Переменные окружения (backend)
Пример `.env` (значения подобрать под проект):
- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/mini-instagram`
- `JWT_SECRET=super_secret_key`
- `JWT_EXPIRES=7d`
- `CORS_ORIGIN=http://localhost:3000`

## Запуск
- Backend: запуск dev‑сервера в `backend/`.
- Frontend: запуск dev‑сервера в `frontend/`.

## Проверка подключения к MongoDB
- При старте backend логируется успешное подключение.
- При ошибке — процесс не должен стартовать.

