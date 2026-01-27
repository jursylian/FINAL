# Обзор архитектуры

Навигация: [README.md](README.md) → [01-setup.md](01-setup.md) → [02-phases.md](02-phases.md)

## Цель проекта
Учебный сервис с базовым функционалом Instagram: регистрация, логин, профиль, посты, лайки, комментарии, поиск, explore, подписки, уведомления. Чат на Socket.io — опционально.

## Технологический стек
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, dotenv, multer (memoryStorage)
- Frontend: React, роутинг, формы, protected routes, FormData для файлов

## Архитектура (высокоуровнево)
- Backend: REST API + JWT‑аутентификация, данные в MongoDB (Mongoose)
- Frontend: SPA на React, авторизация через токен, загрузка файлов через FormData

## Структура репозитория (рекомендация)
- `backend/` — серверный код
- `frontend/` — клиентский код
- `docs/` — документация проекта

## Структура backend (логика по слоям)
- Routes → Controllers → Models
- Middlewares: auth, error handler, upload
- Utils: jwt, hash, validation

## Структура frontend (логика по слоям)
- Pages (маршруты)
- Components (UI)
- API client (fetch/axios)
- State (Context/Redux)

## Поток данных (пример)
1. Пользователь логинится → получает JWT.
2. Frontend сохраняет токен и отправляет его в `Authorization: Bearer <token>`.
3. Backend проверяет токен в middleware и дает доступ к защищенным эндпоинтам.

