# Установка и запуск

Навигация: [README.md](README.md) → [00-overview.md](00-overview.md) → [02-phases.md](02-phases.md)

## Предварительные требования
- Node.js LTS (18+)
- MongoDB (локально или MongoDB Atlas)
- npm (рекомендуется) / yarn / pnpm

## Установка зависимостей

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Переменные окружения

### Backend (`backend/.env`)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/mini-instagram
JWT_SECRET=change_me_to_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

| Переменная | Описание | Пример |
|------------|----------|--------|
| `PORT` | Порт backend сервера | `4000` |
| `MONGO_URI` | URI подключения к MongoDB | `mongodb://localhost:27017/mini-instagram` |
| `JWT_SECRET` | Секретный ключ для JWT | Случайная строка |
| `JWT_EXPIRES_IN` | Время жизни токена | `7d`, `24h`, `1h` |
| `CORS_ORIGIN` | Разрешённый origin для CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

| Переменная | Описание | Пример |
|------------|----------|--------|
| `VITE_API_BASE_URL` | Базовый URL API | `http://localhost:4000/api` |

## Запуск

### Development

```bash
# Backend (порт 4000)
cd backend
npm run dev

# Frontend (порт 5173)
cd frontend
npm run dev
```

### Production build

```bash
# Frontend
cd frontend
npm run build
npm run preview
```

## Проверка работоспособности

1. **MongoDB**: При старте backend в консоли должно появиться сообщение об успешном подключении.

2. **Backend API**: Открыть `http://localhost:4000/api` — должен вернуться ответ.

3. **Frontend**: Открыть `http://localhost:5173` — должна загрузиться страница логина.

## Типичные проблемы

| Проблема | Решение |
|----------|---------|
| MongoDB connection error | Проверить, что MongoDB запущена и `MONGO_URI` корректен |
| CORS error | Проверить, что `CORS_ORIGIN` в backend соответствует URL frontend |
| 401 Unauthorized | Токен истёк или невалиден, перелогиниться |
| Network error | Проверить, что backend запущен на правильном порту |
