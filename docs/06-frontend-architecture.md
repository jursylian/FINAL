# Архитектура frontend

Навигация: [README.md](README.md) → [05-api-spec.md](05-api-spec.md) → [07-feature-guides.md](07-feature-guides.md)

## Страницы и маршруты

### Публичные (без авторизации)
| Маршрут | Компонент | Описание |
|---------|-----------|----------|
| `/login` | Login.jsx | Логин |
| `/register` | Register.jsx | Регистрация |
| `/reset` | Reset.jsx | Запрос сброса пароля |
| `/reset-password` | ResetPassword.jsx | Установка нового пароля |

### Защищённые (требуют авторизации)
| Маршрут | Компонент | Описание |
|---------|-----------|----------|
| `/` | Feed.jsx | Главная лента постов |
| `/explore` | Explore.jsx | Explore (случайные посты) |
| `/post/:id` | PostDetail.jsx | Детальная страница поста |
| `/create` | PostCreate.jsx | Создание поста (alias) |
| `/posts/new` | PostCreate.jsx | Создание поста (mobile) |
| `/profile/:id` | Profile.jsx | Профиль пользователя |
| `/profile/:id/edit` | ProfileEdit.jsx | Редактирование профиля |
| `/profile/:id/followers` | Followers.jsx | Список подписчиков |
| `/profile/:id/following` | Following.jsx | Список подписок |
| `/search` | Search.jsx | Поиск (mobile) |
| `/notifications` | Notifications.jsx | Уведомления (mobile) |
| `*` | NotFound.jsx | 404 страница |

### Панели в Sidebar (desktop)
- **Search** — панель поиска пользователей
- **Notifications** — панель уведомлений

## Protected routes

Реализация: `src/auth/ProtectedRoute.jsx`

- Проверяет наличие токена в `AuthContext`.
- При загрузке показывает "Loading...".
- При отсутствии токена — редирект на `/login`.
- При ошибке токена — показывает сообщение "Session expired".

## Работа с токеном

Реализация: `src/auth/AuthContext.jsx`

- Токен хранится в `localStorage`.
- При старте приложения проверяется через `GET /auth/me`.
- Автоматически добавляется в запросы через `apiClient.js`.

Контекст предоставляет:
- `token` — текущий токен
- `user` — данные пользователя
- `loading` — состояние загрузки
- `error` — ошибка авторизации
- `login()` — вход
- `register()` — регистрация
- `logout()` — выход
- `updateUser()` — обновление данных пользователя

## API-клиент

Реализация: `src/lib/apiClient.js`

```javascript
export async function request(path, options = {})
```

- Базовый URL из `VITE_API_BASE_URL` (по умолчанию `http://localhost:4000/api`)
- Автоматическая подстановка `Authorization: Bearer <token>`
- Автоматический `Content-Type: application/json` (кроме FormData)
- Унифицированная обработка ошибок

## Загрузка изображений

- Использовать `FormData` и поле `image`.
- Не устанавливать `Content-Type` вручную — браузер выставит сам.

Примеры использования:
- `PostCreateContent.jsx` — создание поста
- `ProfileEdit.jsx` — загрузка аватара

## State management

- **AuthContext** — глобальное состояние авторизации
- **useState/useEffect** — локальное состояние компонентов
- **Custom events** — синхронизация между компонентами (`post:created`, `post:updated`)

## Responsive design

Реализация: `src/lib/useIsDesktop.js`

Хук `useIsDesktop()` возвращает `true` для экранов >= 768px.

Адаптивное поведение:
- **Desktop**: модальные окна для постов, панели search/notifications в sidebar
- **Mobile**: отдельные страницы для постов, notifications; hamburger-меню

## Утилиты

### constants.js
```javascript
export const DEFAULT_LIMIT = 50;   // Лимит для списков
export const EXPLORE_LIMIT = 10;   // Лимит для explore
```

### timeAgo.js
```javascript
export default function timeAgo(date)
// Возвращает: "just now", "5 minutes ago", "2 hours ago", "3 days ago", etc.
```

### recentSearches.js
Управление недавними поисками в localStorage:
- `getRecent()` — получить список последних поисков
- `addRecent(item, limit)` — добавить запись (по умолчанию до 15)
- `removeRecent(userId)` — удалить запись
- `clearRecent()` — очистить все

### useLikeToggle.js
Хук и утилита для лайков постов:
- `toggleLike(postId)` — одиночный toggle-запрос
- `useLikeToggle(postId, { onUpdate, onError })` — хук с состоянием загрузки

### authStyles.js
Общие стили для форм авторизации:
- `authInputClass` — стандартный input (268px)
- `authInputWideClass` — широкий input (300px)
- `authButtonClass` — стандартная кнопка (268px)
- `authButtonWideClass` — широкая кнопка (300px)

## Компоненты

### Layout
- **AppLayout** — основной layout с sidebar, footer, панелями search/notifications
- **Sidebar** — навигация (Home, Search, Explore, Messages, Notifications, Create, Profile, Logout)

### Посты
- **FeedPost** — карточка поста в ленте
- **PostModal** — модальное окно с постом (desktop)
- **PostCreateModal** — модальное окно создания/редактирования поста
- **PostCreateContent** — форма создания/редактирования поста

### Поиск
- **SearchPanel** — панель поиска с debounce-запросами и недавними поисками

### Пользователи
- **UserAvatar** — аватар с fallback на инициалы
- **UserLink** — ссылка на профиль пользователя
- **UserList** — переиспользуемый список пользователей (followers/following)

### Формы
- **FormField** — переиспользуемая обёртка для полей форм

### Общие
- **Footer** — подвал страницы

### Модальные окна
- **ModalShell** — обёртка для модальных окон с preset'ами (post, create, menu)
- **ModalStackRoot/ModalWindow** — низкоуровневые компоненты для модалок

### Уведомления
- **NotificationsList** — список уведомлений с mark as read
