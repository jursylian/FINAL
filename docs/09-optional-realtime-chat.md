# Опциональный чат (Socket.io)

Навигация: [README.md](README.md) → [02-phases.md](02-phases.md)

Фаза 11 является опциональной. Можно пропустить без влияния на базовый функционал.

## События (пример)
- `connection` / `disconnect`
- `room:join` (вход в комнату)
- `message:send` (отправка)
- `message:new` (получение)
- `message:history` (история)

## Хранение сообщений
- Модель `Message` (см. [04-database-models.md](04-database-models.md)).
- `roomId` формируется из пары пользователей или отдельной сущности диалога.

## UI
- `/chat` или `/messages`.
- Список диалогов + окно переписки.

