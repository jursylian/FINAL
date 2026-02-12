# Маршрутизация: backend и frontend

[< Назад к содержанию](README.md)

---

## Backend: структура маршрутов

### Монтирование в app.js

```
Express App (app.js)
│
├── cors()                              ← CORS middleware (все запросы)
├── express.json()                      ← JSON body parser (все запросы)
│
├── GET  /api/health                    ← Healthcheck (без auth)
│
├── /api/auth ─────────► authRoutes.js
├── /api/users ────────► usersRoutes.js
├── /api/posts ────────► postsRoutes.js
├── /api/feed ─────────► feedRoutes.js
├── /api/search ───────► searchRoutes.js
├── /api/explore ──────► exploreRoutes.js
├── /api/notifications ► notificationsRoutes.js
├── /api/comments ─────► commentsRoutes.js
│
├── 404 handler                         ← Несуществующие маршруты
└── Error handler                       ← Глобальная обработка ошибок
```

### Полная карта эндпоинтов

```
┌───────┬──────────────────────────────┬──────────────┬────────────────────────┐
│ Метод │ URL                          │ Auth         │ Описание               │
├───────┼──────────────────────────────┼──────────────┼────────────────────────┤
│       │                              │              │                        │
│       │ AUTH                         │              │                        │
│ POST  │ /api/auth/register           │ —            │ Регистрация            │
│ POST  │ /api/auth/login              │ —            │ Логин                  │
│ GET   │ /api/auth/me                 │ required     │ Текущий пользователь   │
│ POST  │ /api/auth/forgot-password    │ —            │ Запрос сброса пароля   │
│ POST  │ /api/auth/reset-password     │ —            │ Установка нового пароля│
│       │                              │              │                        │
│       │ USERS                        │              │                        │
│ GET   │ /api/users/:id               │ optional     │ Профиль пользователя   │
│ PATCH │ /api/users/:id               │ required     │ Обновить профиль       │
│ PATCH │ /api/users/:id/avatar        │ required     │ Обновить аватар        │
│ GET   │ /api/users/:id/posts         │ optional     │ Посты пользователя     │
│ POST  │ /api/users/:id/follow        │ required     │ Follow/unfollow        │
│ GET   │ /api/users/:id/followers     │ —            │ Список подписчиков     │
│ GET   │ /api/users/:id/following     │ —            │ Список подписок        │
│       │                              │              │                        │
│       │ POSTS                        │              │                        │
│ POST  │ /api/posts                   │ required     │ Создать пост           │
│ GET   │ /api/posts                   │ required     │ Лента (alias home)     │
│ GET   │ /api/posts/feed/home         │ required     │ Home feed              │
│ GET   │ /api/posts/feed/explore      │ required     │ Explore feed           │
│ GET   │ /api/posts/:id               │ optional     │ Детали поста           │
│ PATCH │ /api/posts/:id               │ required     │ Обновить подпись       │
│ DELETE│ /api/posts/:id               │ required     │ Удалить пост           │
│ POST  │ /api/posts/:id/like          │ required     │ Toggle like            │
│ POST  │ /api/posts/:id/comments      │ required     │ Добавить комментарий   │
│ GET   │ /api/posts/:id/comments      │ optional     │ Список комментариев    │
│       │                              │              │                        │
│       │ FEED                         │              │                        │
│ GET   │ /api/feed/home               │ required     │ Home feed              │
│ GET   │ /api/feed/explore            │ optional     │ Explore feed           │
│       │                              │              │                        │
│       │ SEARCH                       │              │                        │
│ GET   │ /api/search/users?q=...      │ —            │ Поиск пользователей    │
│       │                              │              │                        │
│       │ EXPLORE                      │              │                        │
│ GET   │ /api/explore/posts           │ —            │ Случайные посты        │
│       │                              │              │                        │
│       │ COMMENTS                     │              │                        │
│ POST  │ /api/comments/:id/like       │ required     │ Toggle like комментария│
│       │                              │              │                        │
│       │ NOTIFICATIONS                │              │                        │
│ GET   │ /api/notifications           │ required     │ Список уведомлений     │
│ GET   │ /api/notifications/unread-count│ required   │ Счётчик непрочитанных  │
│ PATCH │ /api/notifications/:id/read  │ required     │ Пометить прочитанным   │
│ DELETE│ /api/notifications/:id       │ required     │ Удалить уведомление    │
│       │                              │              │                        │
│       │ HEALTH                       │              │                        │
│ GET   │ /api/health                  │ —            │ Статус сервера         │
└───────┴──────────────────────────────┴──────────────┴────────────────────────┘

Auth:
  required  = auth middleware (JWT обязателен, иначе 401)
  optional  = optionalAuth middleware (JWT проверяется, если есть)
  —         = без аутентификации
```

### Как auth применяется к маршрутам

```javascript
// authRoutes.js — без auth (публичные)
router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);             // ← только /me защищён

// postsRoutes.js — смешанные
router.post("/", auth, upload.single("image"), createPost);  // auth + upload
router.get("/:id", optionalAuth, getPost);                   // optional
router.delete("/:id", auth, deletePost);                     // auth

// usersRoutes.js — смешанные
router.get("/:id", optionalAuth, getProfile);                // optional
router.get("/:id/followers", listFollowers);                 // без auth
router.patch("/:id", auth, updateProfile);                   // auth
router.patch("/:id/avatar", auth, upload.single("image"), updateAvatar);
//                          ▲    ▲
//                          │    └── Multer парсит файл
//                          └── JWT проверка
```

### Порядок middleware в цепочке

```
Запрос HTTP
    │
    ▼
┌──────────┐   ┌──────────┐   ┌───────────┐   ┌────────────┐
│  cors()  │──►│  json()  │──►│ auth/     │──►│ upload/    │──► Controller
│          │   │          │   │ optional  │   │ (если есть)│
└──────────┘   └──────────┘   └───────────┘   └────────────┘
 Глобальный     Глобальный     Per-route       Per-route

Глобальные middleware применяются ко ВСЕМ запросам.
Per-route middleware — только к конкретным маршрутам.
```

---

## Frontend: клиентская маршрутизация

### Дерево маршрутов (App.jsx)

```
<BrowserRouter>                         ← React Router провайдер
  <AuthProvider>                        ← Контекст авторизации
    <Routes>
      │
      ├── /login          → <Login />           ← Публичный
      ├── /register       → <Register />        ← Публичный
      ├── /reset          → <Reset />           ← Публичный
      ├── /reset-password → <ResetPassword />   ← Публичный
      │
      ├── <ProtectedRoute>                      ← Проверка токена
      │   └── <AppLayout>                       ← Sidebar + Outlet
      │       │
      │       ├── /                → <Feed />
      │       ├── /create          → <PostCreate />
      │       ├── /posts/new       → <PostCreate />
      │       ├── /post/:id        → <PostDetail />
      │       ├── /profile/:id     → <Profile />
      │       ├── /profile/:id/edit     → <ProfileEdit />
      │       ├── /profile/:id/followers → <Followers />
      │       ├── /profile/:id/following → <Following />
      │       ├── /explore         → <Explore />
      │       ├── /search          → <Search />
      │       └── /notifications   → <Notifications />
      │
      └── *                → <NotFound />       ← 404 fallback
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### Как работает защита маршрутов

```
Пользователь набирает /profile/123
        │
        ▼
  React Router находит маршрут
        │
        ▼
  Обёрнут в <ProtectedRoute>?
        │
   ┌────┴────┐
   Нет       Да
   │         │
   ▼         ▼
  Рендер   ProtectedRoute:
  страницы  │
            ├── loading? → "Loading..."
            ├── !token?  → <Navigate to="/login">
            └── token    → {children} (рендер страницы)
```

### Вложенные маршруты и <Outlet>

```
<Route element={<AppLayout />}>      ← layout-route (без path)
  <Route path="/" element={<Feed />} />
  <Route path="/explore" element={<Explore />} />
  ...
</Route>

AppLayout рендерит:
┌─────────────────────────────────────────────┐
│ ┌──────────┐  ┌────────────────────────────┐│
│ │          │  │                            ││
│ │ Sidebar  │  │  <Outlet />               ││
│ │          │  │  (здесь рендерится         ││
│ │  Home    │  │   дочерний маршрут:        ││
│ │  Search  │  │   Feed, Explore, Profile)  ││
│ │  Explore │  │                            ││
│ │  ...     │  │                            ││
│ │          │  │                            ││
│ └──────────┘  └────────────────────────────┘│
│ ┌──────────────────────────────────────────┐│
│ │           Footer (mobile)                ││
│ └──────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Desktop vs Mobile маршруты

```
Некоторые функции работают по-разному в зависимости от размера экрана:

Desktop (≥ 768px):                    Mobile (< 768px):
──────────────────                    ─────────────────

Поиск:                                Поиск:
SearchPanel открывается               /search → <Search /> (страница)
как боковая панель                     рендерит SearchPanel внутри
в LeftPanelFixed                       отдельной страницы

Уведомления:                          Уведомления:
NotificationsList в                    /notifications → <Notifications />
боковой панели                         отдельная страница

Создание поста:                       Создание поста:
PostCreateModal                        /create или /posts/new
(модальное окно)                       отдельная страница

Просмотр поста:                       Просмотр поста:
PostModal                              /post/:id → <PostDetail />
(модальное окно)                       отдельная страница

Определение размера:
useIsDesktop() → window.matchMedia("(min-width: 768px)")
```

### Панели Sidebar (LeftPanelFixed)

```
На десктопе Sidebar содержит кнопки Search и Notifications.
Клик не переходит на страницу, а открывает боковую панель:

┌──────────┐  ┌────────────────┐  ┌────────────────────┐
│          │  │                │  │                    │
│ Sidebar  │  │ LeftPanelFixed │  │  Основной контент  │
│          │  │                │  │                    │
│ [Home]   │  │ ┌────────────┐ │  │  <Outlet />       │
│ [Search] │──│ │SearchPanel │ │  │                    │
│ [Explore]│  │ │ или        │ │  │                    │
│ [Notif.] │──│ │Notifications│ │  │                    │
│ [Create] │  │ └────────────┘ │  │                    │
│ [Profile]│  │                │  │                    │
│          │  │ translate-x    │  │                    │
│          │  │ анимация       │  │                    │
└──────────┘  └────────────────┘  └────────────────────┘
   245px          397px               остальное

Панель анимируется через CSS transform:
open  → translate-x-0    (видна)
close → -translate-x-full (скрыта за sidebar)
```

---

## Обработка ошибок

### Backend: errorHandler.js

```
handleError(err, res):
        │
        ▼
  err.name === "ValidationError"?
  → 400 { message: err.message, details: err.errors }
  (Mongoose валидация: email формат, maxlength и т.д.)
        │
        ▼
  err.code === 11000?
  → 409 { message: "Duplicate entry" }
  (MongoDB: нарушение unique-индекса)
        │
        ▼
  Всё остальное:
  → 500 { message: "Internal Server Error" }
  + console.error(err)
```

### Backend: глобальный error handler (app.js)

```
// Ловит ошибки, которые не поймал контроллер
app.use((err, _req, res, _next) => {
  err.type === "entity.parse.failed"?
  → 400 { message: "Invalid JSON" }
  (Невалидный JSON в теле запроса)

  Всё остальное:
  → 500 { message: "Internal Server Error" }
});
```

### Frontend: apiClient.js

```
response.ok?
├── Да → return data
└── Нет:
    const error = new Error(data.message || "Request failed")
    error.status = response.status    ← HTTP код (400, 401, 403, 404, 500)
    error.details = data              ← полный ответ сервера
    throw error

    Компоненты ловят ошибку в try/catch
    и показывают error.message пользователю.
```

---

## Синхронизация состояния между компонентами

### Custom Events

```
Проблема:
  PostCreateModal создаёт пост → Feed должна обновиться.
  Но Feed и PostCreateModal — разные компоненты без общего state.

Решение: Custom DOM Events.

PostCreateContent.jsx:
  window.dispatchEvent(new Event("post:created"))

Feed.jsx:
  useEffect(() => {
    const handler = () => loadFeed();
    window.addEventListener("post:created", handler);
    return () => window.removeEventListener("post:created", handler);
  }, []);

Список событий:
  "post:created"  → обновить ленту
  "post:updated"  → обновить пост в ленте
```
