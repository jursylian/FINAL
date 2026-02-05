# Обзор архитектуры

Навигация: [README.md](README.md) → [01-setup.md](01-setup.md) → [02-phases.md](02-phases.md)

## Цель проекта

Учебный сервис с базовым функционалом Instagram: регистрация, логин, профиль, посты, лайки, комментарии, поиск, explore, подписки, уведомления. Чат на Socket.io — опционально.

## Технологический стек

### Backend
| Технология | Версия | Назначение |
|------------|--------|------------|
| Node.js | 18+ | Runtime |
| Express | 5.x | Web framework |
| MongoDB | — | База данных |
| Mongoose | 9.x | ODM |
| JWT | — | Аутентификация |
| bcryptjs | — | Хеширование паролей |
| Multer | — | Загрузка файлов (Base64) |

### Frontend
| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 18.x | UI библиотека |
| Vite | 7.x | Сборщик |
| React Router DOM | 6.x | Роутинг |
| Tailwind CSS | 4.x | Стилизация |
| React Hook Form | — | Формы |
| Lucide React | — | Иконки |

## Архитектура

```
┌─────────────────┐     HTTP/REST     ┌─────────────────┐
│                 │ ◄───────────────► │                 │
│  React SPA      │                   │  Express API    │
│  (Frontend)     │   JWT Token       │  (Backend)      │
│                 │                   │                 │
└─────────────────┘                   └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │                 │
                                      │    MongoDB      │
                                      │                 │
                                      └─────────────────┘
```

## Структура репозитория

```
project/
├── backend/           # Серверный код
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middlewares/
│       └── utils/
├── frontend/          # Клиентский код
│   └── src/
│       ├── auth/
│       ├── components/
│       ├── pages/
│       └── lib/
├── docs/              # Документация
└── package.json
```

## Структура backend

```
backend/src/
├── app.js                  # Express приложение
├── server.js               # Точка входа
├── controllers/            # Бизнес-логика
│   ├── authController.js
│   ├── usersController.js
│   ├── postsController.js
│   ├── commentsController.js
│   ├── likesController.js
│   ├── followController.js
│   ├── notificationsController.js
│   ├── searchController.js
│   └── exploreController.js
├── models/                 # Mongoose схемы
│   ├── User.js
│   ├── Post.js
│   ├── Like.js
│   ├── Comment.js
│   ├── Follow.js
│   ├── Notification.js
│   └── Message.js
├── routes/                 # Express роуты
├── middlewares/            # auth, optionalAuth, upload
└── utils/                  # Переиспользуемые утилиты
    ├── db.js
    ├── pagination.js
    ├── errorHandler.js
    ├── objectId.js
    ├── publicUser.js
    └── followingIds.js
```

## Структура frontend

```
frontend/src/
├── auth/                   # Авторизация
│   ├── AuthContext.jsx     # Глобальное состояние auth
│   └── ProtectedRoute.jsx  # Защита роутов
├── components/             # UI компоненты
│   ├── AppLayout.jsx       # Основной layout с sidebar
│   ├── Sidebar.jsx         # Навигация
│   ├── FeedPost.jsx        # Карточка поста
│   ├── PostModal.jsx       # Модальное окно поста
│   ├── PostCreateModal.jsx # Модальное окно создания
│   ├── PostCreateContent.jsx
│   ├── ModalShell.jsx      # Обёртка модальных окон
│   ├── UserAvatar.jsx      # Аватар пользователя
│   ├── UserList.jsx        # Список пользователей
│   └── NotificationsList.jsx
├── pages/                  # Страницы
│   ├── Feed.jsx            # Главная лента
│   ├── Explore.jsx         # Explore
│   ├── Profile.jsx         # Профиль
│   ├── ProfileEdit.jsx     # Редактирование профиля
│   ├── PostDetail.jsx      # Детальная страница поста
│   ├── PostCreate.jsx      # Создание поста (mobile)
│   ├── Followers.jsx       # Список подписчиков
│   ├── Following.jsx       # Список подписок
│   ├── Notifications.jsx   # Уведомления (mobile)
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Reset.jsx
│   ├── ResetPassword.jsx
│   └── NotFound.jsx
├── lib/                    # Утилиты
│   ├── apiClient.js        # API клиент с авто-токеном
│   ├── constants.js        # DEFAULT_LIMIT, EXPLORE_LIMIT
│   ├── timeAgo.js          # Относительное время
│   ├── useIsDesktop.js     # Хук для responsive
│   └── authStyles.js       # Общие стили auth-форм
├── App.jsx                 # Роутинг
├── main.jsx                # Точка входа
└── index.css               # Глобальные стили
```

## Поток данных

1. Пользователь логинится → получает JWT
2. Frontend сохраняет токен в `localStorage`
3. Каждый запрос отправляет `Authorization: Bearer <token>`
4. Backend проверяет токен в middleware
5. При невалидном токене → редирект на `/login`

## Хранение изображений

Изображения хранятся как **Base64 Data URL** в MongoDB:

```
image: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

Подробнее: [03-backend-architecture.md](03-backend-architecture.md#загрузка-изображений)
