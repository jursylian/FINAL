# Документация учебного проекта (мини‑Instagram)

Практичные инструкции по реализации учебного сервиса (мини‑версия Instagram) на Node.js + Express + MongoDB и React. Документация разбита на файлы и строго следует плану фаз.

## Навигация
- [00-overview.md](00-overview.md) — архитектура, стек, структура репозитория
- [01-setup.md](01-setup.md) — установка, env, запуск backend/frontend
- [02-phases.md](02-phases.md) — план фаз + чек‑листы по каждой фазе
- [03-backend-architecture.md](03-backend-architecture.md) — папки backend, паттерны, обработка ошибок
- [04-database-models.md](04-database-models.md) — модели, индексы, связи
- [05-api-spec.md](05-api-spec.md) — спецификация REST API
- [06-frontend-architecture.md](06-frontend-architecture.md) — страницы, роутинг, состояние, токен
- [07-feature-guides.md](07-feature-guides.md) — how‑to по ключевым фичам
- [08-testing-checklist.md](08-testing-checklist.md) — ручные тест‑кейсы и smoke
- [09-optional-realtime-chat.md](09-optional-realtime-chat.md) — опциональный чат на Socket.io

## Важные принципы
- Документация не содержит кода приложения — только инструкции, контракты и чек‑листы.
- Фазы описаны строго в заданном порядке; после backend‑auth сразу frontend‑auth.
- Все контракты REST согласованы между файлами.
