# ICHgram — Учебный проект (мини-Instagram)

Практичные инструкции по реализации учебного сервиса на Node.js + Express + MongoDB и React.

## Статус проекта

**Версия:** 1.0 (учебная)
**Статус:** Завершен, готов к использованию

### Реализованный функционал

| Функция | Статус |
|---------|--------|
| Регистрация / Логин / Сброс пароля | ✅ |
| Профиль (редактирование, аватар) | ✅ |
| Посты (создание, редактирование, удаление) | ✅ |
| Лайки | ✅ |
| Комментарии | ✅ |
| Подписки (follow/unfollow) | ✅ |
| Лента (посты подписок) | ✅ |
| Explore (случайные посты) | ✅ |
| Поиск пользователей | ✅ |
| Уведомления | ✅ |
| Адаптивный дизайн (mobile/desktop) | ✅ |
| Чат (Socket.io) | ❌ Опционально |

## Навигация по документации

| Файл | Описание |
|------|----------|
| [00-overview.md](00-overview.md) | Архитектура, стек, структура репозитория |
| [01-setup.md](01-setup.md) | Установка, env, запуск backend/frontend |
| [02-phases.md](02-phases.md) | План фаз + чек-листы |
| [03-backend-architecture.md](03-backend-architecture.md) | Папки backend, паттерны, обработка ошибок |
| [04-database-models.md](04-database-models.md) | Модели, индексы, связи |
| [05-api-spec.md](05-api-spec.md) | Спецификация REST API |
| [06-frontend-architecture.md](06-frontend-architecture.md) | Страницы, роутинг, компоненты |
| [07-feature-guides.md](07-feature-guides.md) | How-to по ключевым фичам |
| [08-testing-checklist.md](08-testing-checklist.md) | Ручные тест-кейсы |
| [09-optional-realtime-chat.md](09-optional-realtime-chat.md) | Опциональный чат на Socket.io |
| [info.md](info.md) | Полное описание проекта |
| **[detailed/](detailed/README.md)** | **Детальное описание реализации (схемы, потоки, стек)** |

## Технологический стек

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **База данных:** MongoDB + Mongoose 9
- **Аутентификация:** JWT + bcrypt
- **Загрузка файлов:** Multer (memoryStorage → Base64)

### Frontend
- **Framework:** React 18
- **Сборщик:** Vite 7
- **Роутинг:** React Router DOM 6
- **Стилизация:** Tailwind CSS 4
- **Формы:** React Hook Form

## Особенности реализации

### Хранение изображений (Base64)

Изображения хранятся как Base64 Data URL непосредственно в MongoDB:

```
image: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

**Почему так:**
- Простота реализации для учебного проекта
- Не требует настройки файлового хранилища
- Работает "из коробки"

**Ограничения:**
- +33% к размеру файла
- Нагрузка на БД при больших объемах
- Лимит документа MongoDB: 16MB

**Для production рекомендуется:**
- Cloudinary (бесплатный план 25GB)
- AWS S3 / DigitalOcean Spaces
- Локальное хранение файлов

### Архитектура Backend

```
backend/src/
├── controllers/    # Бизнес-логика
├── models/         # Mongoose схемы
├── routes/         # Express роуты
├── middlewares/    # auth, upload
└── utils/          # Переиспользуемые утилиты
    ├── db.js
    ├── pagination.js
    ├── errorHandler.js
    ├── objectId.js
    ├── publicUser.js
    ├── followingIds.js
    └── toDataUrl.js
```

### Архитектура Frontend

```
frontend/src/
├── auth/           # AuthContext, ProtectedRoute
├── components/     # UI компоненты
├── pages/          # Страницы
└── lib/            # Утилиты
    ├── apiClient.js
    ├── constants.js
    ├── timeAgo.js
    ├── useIsDesktop.js
    ├── useLikeToggle.js
    ├── recentSearches.js
    └── authStyles.js
```

## Рекомендации для дальнейшего развития

### Приоритет 1 (если проект станет production)
- [ ] Перенести изображения в Cloudinary/S3
- [ ] Добавить rate limiting
- [ ] Добавить валидацию входных данных (express-validator)
- [ ] Настроить helmet для security headers

### Приоритет 2 (улучшения)
- [ ] Добавить пагинацию "бесконечная прокрутка"
- [ ] Реализовать чат на Socket.io
- [ ] Добавить push-уведомления
- [ ] Оптимизировать запросы (индексы, агрегации)

### Приоритет 3 (масштабирование)
- [ ] Вынести сессии в Redis
- [ ] Настроить Docker + docker-compose
- [ ] CI/CD pipeline
- [ ] Мониторинг и логирование

## Принципы документации

- Документация не содержит кода — только инструкции и контракты
- Все REST API контракты согласованы между файлами
- Фазы описаны в заданном порядке
