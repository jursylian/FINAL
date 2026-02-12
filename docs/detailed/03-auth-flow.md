# Аутентификация: регистрация, логин, JWT, сброс пароля

[< Назад к содержанию](README.md) | [Далее: Посты и лайки >](04-posts-and-likes.md)

---

## Общая схема аутентификации

```
┌─────────────────────────────────────────────────────────────────┐
│                     Поток аутентификации                        │
│                                                                 │
│  Браузер                    Сервер                   MongoDB    │
│                                                                 │
│  1. POST /auth/register ──────► authController.register()       │
│     или POST /auth/login  ──────► authController.login()        │
│                                       │                         │
│                                       ▼                         │
│                                 Проверка данных                 │
│                                 Создание/поиск User             │
│                                 buildToken(userId)              │
│                                       │                         │
│                              ◄────────┘                         │
│  { token: "eyJ...", user: {...} }                               │
│         │                                                       │
│         ▼                                                       │
│  localStorage.setItem("token", token)                           │
│         │                                                       │
│         ▼                                                       │
│  Каждый последующий запрос:                                     │
│  Authorization: Bearer eyJ...                                   │
│         │                                                       │
│         ▼                                                       │
│  auth middleware ──► jwt.verify() ──► req.userId = payload.sub  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Регистрация (POST /api/auth/register)

### Последовательность действий

```
Клиент (Register.jsx)                  Сервер (authController.register)
        │                                           │
   1.   │  POST /api/auth/register                  │
        │  { email, username, password, name }      │
        ├──────────────────────────────────────────►│
        │                                           │
        │                                      2.   │ Валидация:
        │                                           │ • email, username, password обязательны?
        │                                           │ • password >= 8 символов?
        │                                           │ │ ──► 400 "Missing required fields"
        │                                           │
        │                                      3.   │ Нормализация:
        │                                           │ • email → toLowerCase().trim()
        │                                           │ • username → trim()
        │                                           │
        │                                      4.   │ Проверка уникальности:
        │                                           │ User.findOne({ $or: [
        │                                           │   { email: normalizedEmail },
        │                                           │   { username: normalizedUsername }
        │                                           │ ]})
        │                                           │ │ ──► 409 "Email or username already in use"
        │                                           │
        │                                      5.   │ Создание пользователя:
        │                                           │ new User({ email, username, password, name })
        │                                           │ user.save()
        │                                           │     │
        │                                           │     ▼ pre('save') hook:
        │                                           │     bcrypt.hash(password, 10)
        │                                           │     password = "$2a$10$..."
        │                                           │
        │                                      6.   │ Генерация JWT:
        │                                           │ jwt.sign({ sub: user._id }, JWT_SECRET, {
        │                                           │   expiresIn: "7d"
        │                                           │ })
        │                                           │
        │  201 { token: "eyJ...", user: {...} }     │
        │◄──────────────────────────────────────────┤
        │                                           │
   7.   │ localStorage.setItem("token", token)
        │ setToken(token)
        │ setUser(user)
        │ → Redirect to "/"
```

### Что происходит на frontend (AuthContext.jsx)

```javascript
// 1. Пользователь заполняет форму Register.jsx
// 2. Вызывается register() из AuthContext:

async function register({ email, username, password, name }) {
  // Отправляет POST запрос через apiClient
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password, name }),
  });

  // Сохраняет токен в localStorage
  localStorage.setItem("token", data.token);
  // Обновляет React state → компоненты перерендериваются
  setToken(data.token);
  setUser(data.user);
}
```

### Что происходит с паролем

```
Ввод пользователя:    "MyPassword123"
                           │
                           ▼
              bcrypt.hash("MyPassword123", 10)
                           │
                           ▼
Хранится в MongoDB:   "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
                           │
                           ▼
              Невозможно восстановить исходный пароль.
              Проверка: bcrypt.compare("MyPassword123", hash) → true
```

---

## Логин (POST /api/auth/login)

### Последовательность действий

```
Клиент (Login.jsx)                     Сервер (authController.login)
        │                                           │
   1.   │  POST /api/auth/login                     │
        │  { email|username, password }             │
        ├──────────────────────────────────────────►│
        │                                           │
        │                                      2.   │ Определить способ входа:
        │                                           │ email? → { email: value }
        │                                           │ username? → { username: value }
        │                                           │
        │                                      3.   │ Поиск пользователя:
        │                                           │ User.findOne(query).select('+password')
        │                                           │     ▲
        │                                           │     │ select('+password') нужен,
        │                                           │     │ т.к. password.select = false
        │                                           │
        │                                      4.   │ Если не найден:
        │                                           │ │ ──► 401 "Invalid credentials"
        │                                           │
        │                                      5.   │ Проверка пароля:
        │                                           │ user.comparePassword(password)
        │                                           │ → bcrypt.compare(password, user.password)
        │                                           │
        │                                           │ Если не совпал:
        │                                           │ │ ──► 401 "Invalid credentials"
        │                                           │
        │                                      6.   │ Генерация JWT:
        │                                           │ buildToken(user._id)
        │                                           │
        │  200 { token: "eyJ...", user: {...} }     │
        │◄──────────────────────────────────────────┤
        │                                           │
   7.   │ localStorage.setItem("token", token)
        │ setToken(token) → setUser(user)
        │ → Redirect to "/"
```

---

## JWT: как работает токен

### Структура токена

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjVhYjEyMyIsImlhdCI6MTcxNzA3OTM2MCwiZXhwIjoxNzE3Njg0MTYwfQ.abc123signature
│                                      │                                                                                │                │
└──────── Header (base64) ─────────────┘└───────────────────────── Payload (base64) ──────────────────────────────────────┘└── Signature ──┘

Header:    { "alg": "HS256", "typ": "JWT" }
Payload:   { "sub": "665ab123...", "iat": 1717079360, "exp": 1717684160 }
Signature: HMACSHA256(header + "." + payload, JWT_SECRET)
```

| Поле | Описание |
|---|---|
| `sub` | Subject — ID пользователя (MongoDB ObjectId) |
| `iat` | Issued At — время создания токена (UNIX timestamp) |
| `exp` | Expiration — время истечения (iat + 7 дней) |

### Как токен проверяется (auth middleware)

```
Каждый защищённый запрос:
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  GET /api/posts                                              │
│  Authorization: Bearer eyJhbGci...                           │
│         │                                                    │
│         ▼                                                    │
│  auth.js middleware:                                          │
│                                                              │
│  1. Извлечь заголовок: req.headers.authorization             │
│     "Bearer eyJhbGci..." → split(" ") → ["Bearer", "eyJ..."]│
│                                                              │
│  2. Тип = "Bearer"? ── Нет ──► 401 "Unauthorized"           │
│                                                              │
│  3. jwt.verify(token, JWT_SECRET)                            │
│     ├── Подпись валидна? ── Нет ──► 401 "Unauthorized"       │
│     ├── Токен не истёк? ── Нет ──► 401 "Unauthorized"        │
│     └── Всё ок ──► payload = { sub: "userId" }              │
│                                                              │
│  4. req.userId = payload.sub                                 │
│                                                              │
│  5. next() → контроллер получает req.userId                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Обязательная vs опциональная аутентификация

```
auth.js (обязательная):              optionalAuth.js (опциональная):
─────────────────────                ─────────────────────────────
Нет токена → 401                     Нет токена → next() (продолжить)
Невалидный → 401                     Невалидный → next() (продолжить)
Валидный → req.userId                Валидный → req.userId

Используется для:                    Используется для:
• POST /posts (создание)             • GET /posts/:id (просмотр)
• POST /posts/:id/like               • GET /explore/posts
• PATCH /users/:id                   • GET /users/:id
• GET /notifications                 • GET /posts/:id/comments
• DELETE /posts/:id

Для чего optionalAuth: показать «liked by you» в посте, даже
если неавторизованный пользователь может видеть пост.
```

---

## Автоматическая проверка при загрузке (GET /api/auth/me)

```
Загрузка приложения (main.jsx → AuthProvider)
        │
        ▼
  token в localStorage?
        │
   ┌────┴────┐
   Нет       Да
   │         │
   ▼         ▼
 loading:  GET /api/auth/me
 false     Authorization: Bearer <token>
 user:          │
 null      ┌───┴────┐
           200      401/ошибка
           │         │
           ▼         ▼
    setUser(data)  localStorage.removeItem("token")
    loading:false  setToken(null), setUser(null)
                   loading: false
                        │
                        ▼
                   ProtectedRoute:
                   token = null → <Navigate to="/login">
```

**Зачем это нужно:** при перезагрузке страницы React-state теряется, но token остаётся в localStorage. AuthProvider проверяет, жив ли токен, запрашивая `/auth/me`. Если токен истёк — пользователь перенаправляется на логин.

---

## Сброс пароля

### Шаг 1: Запрос сброса (POST /api/auth/forgot-password)

```
Клиент (Reset.jsx)                     Сервер (authController.forgotPassword)
        │                                           │
        │  POST { identifier: "user@mail.com" }     │
        ├──────────────────────────────────────────►│
        │                                           │
        │                                      1.   │ Определить: email или username?
        │                                           │ "user@mail.com" содержит "@" → email
        │                                           │
        │                                      2.   │ User.findOne({ email }).select('+reset...')
        │                                           │
        │                                      3.   │ Если не найден → всё равно вернуть 200
        │                                           │ (не раскрывать существование аккаунта)
        │                                           │
        │                                      4.   │ crypto.randomBytes(32) → rawToken (hex)
        │                                           │ sha256(rawToken) → tokenHash
        │                                           │
        │                                      5.   │ user.resetPasswordTokenHash = tokenHash
        │                                           │ user.resetPasswordExpiresAt = now + 15 min
        │                                           │ user.save()
        │                                           │
        │                                      6.   │ Формирование ссылки:
        │                                           │ /reset-password?token=<rawToken>
        │                                           │ (TODO: отправка по email)
        │                                           │
        │  200 { message: "If the account..." }     │
        │◄──────────────────────────────────────────┤
```

**Почему всегда 200:** если возвращать 404 при несуществующем email, злоумышленник может перебирать адреса и определять, кто зарегистрирован.

**Почему хранится хеш токена, а не сам токен:** если база утечёт, злоумышленник не сможет сбросить пароль. Он получит хеш, но не сам токен.

### Шаг 2: Установка нового пароля (POST /api/auth/reset-password)

```
Клиент (ResetPassword.jsx)             Сервер (authController.resetPassword)
        │                                           │
        │  POST { token: "abc...", password: "..." } │
        ├──────────────────────────────────────────►│
        │                                           │
        │                                      1.   │ sha256(token) → tokenHash
        │                                           │
        │                                      2.   │ User.findOne({
        │                                           │   resetPasswordTokenHash: tokenHash,
        │                                           │   resetPasswordExpiresAt: { $gt: now }
        │                                           │ })
        │                                           │
        │                                      3.   │ Не найден или истёк:
        │                                           │ │ ──► 400 "Invalid or expired reset token"
        │                                           │
        │                                      4.   │ user.password = newPassword
        │                                           │ user.resetPasswordTokenHash = undefined
        │                                           │ user.resetPasswordExpiresAt = undefined
        │                                           │ user.save()
        │                                           │     │
        │                                           │     ▼ pre('save'):
        │                                           │     bcrypt.hash(newPassword, 10)
        │                                           │
        │  200 { message: "Password updated" }      │
        │◄──────────────────────────────────────────┤
        │                                           │
        │  → Redirect to /login                     │
```

---

## Защищённые маршруты (ProtectedRoute.jsx)

```
                    ProtectedRoute
                         │
                    ┌────┴────┐
                  loading?    │
                    │         │
                   Да        Нет
                    │         │
                    ▼    ┌────┴────┐
              "Loading..." token?   │
                         │         │
                        Да        Нет
                         │         │
                         ▼    ┌────┴────┐
                    {children} authError?
                    (страница)  │         │
                              Да        Нет
                               │         │
                               ▼         ▼
                      "Session expired" <Navigate to="/login">
```

---

## API-клиент (apiClient.js)

```
request("/posts", { method: "GET" })
        │
        ▼
  1. Получить token из localStorage

  2. Создать Headers:
     Authorization: Bearer <token>    ← автоматически
     Content-Type: application/json   ← если не FormData

  3. fetch(`${VITE_API_BASE_URL}/posts`, { method, headers, body })

  4. Парсинг ответа:
     Content-Type: application/json? → response.json()
     Иначе → null

  5. response.ok?
     ├── Да → return data
     └── Нет → throw new Error(data.message)
              error.status = response.status
              error.details = data
```

**Важно:** при `FormData` (загрузка файлов) клиент НЕ устанавливает `Content-Type`. Браузер сам добавит `multipart/form-data` с правильным boundary.
