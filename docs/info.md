# ICHgram — Полное описание проекта

## Содержание

1. [Обзор проекта](#1-обзор-проекта)
2. [Технологический стек](#2-технологический-стек)
3. [UI-компоненты и shadcn/ui](#3-ui-компоненты-и-shadcnui)
4. [Архитектура](#4-архитектура)
5. [Структура проекта](#5-структура-проекта)
6. [База данных](#6-база-данных)
7. [Аутентификация и авторизация](#7-аутентификация-и-авторизация)
8. [Поток данных](#8-поток-данных)
9. [Посты, лайки, комментарии](#9-посты-лайки-комментарии)
10. [Подписки — детальная реализация](#10-подписки--детальная-реализация)
11. [Уведомления — детальная реализация](#11-уведомления--детальная-реализация)
12. [Поиск и Explore](#12-поиск-и-explore)
13. [Загрузка файлов](#13-загрузка-файлов)
14. [Логирование и обработка ошибок](#14-логирование-и-обработка-ошибок)
15. [Схемы работы приложения](#15-схемы-работы-приложения)
16. [Заключение и рекомендации](#16-заключение-и-рекомендации)

---

## 1. Обзор проекта

**ICHgram** — полнофункциональная социальная сеть, вдохновлённая Instagram. Приложение позволяет пользователям регистрироваться, публиковать фотографии с описаниями, ставить лайки, комментировать, подписываться друг на друга и получать уведомления об активности.

Приложение построено по модели **клиент-сервер**: React SPA (frontend) общается с REST API (backend) через HTTP-запросы, данные хранятся в MongoDB.

---

## 2. Технологический стек

### 2.1 Frontend

| Библиотека | Версия | Назначение |
|---|---|---|
| **React** | 18.3.1 | UI-библиотека для построения интерфейса на компонентах |
| **React DOM** | 18.3.1 | Рендеринг React-компонентов в браузерный DOM |
| **React Router DOM** | 6.28.0 | Маршрутизация (SPA-навигация между страницами без перезагрузки) |
| **Lucide React** | 0.563.0 | Набор SVG-иконок (сердце, комментарий, поиск и т.д.) |
| **clsx** | 2.1.1 | Утилита для условного объединения CSS-классов |
| **tailwind-merge** | 3.4.0 | Слияние Tailwind-классов без конфликтов (например, `p-2` + `p-4` = `p-4`) |
| **class-variance-authority** | 0.7.1 | Создание вариантных компонентов с типизированными пропсами стилей |

**Dev-зависимости:**

| Инструмент | Версия | Назначение |
|---|---|---|
| **Vite** | 7.2.4 | Сборщик и dev-сервер (мгновенный HMR, быстрая сборка) |
| **@vitejs/plugin-react** | 4.3.2 | Плагин Vite для поддержки JSX и Fast Refresh |
| **@tailwindcss/postcss** | 4.1.18 | PostCSS-плагин Tailwind (обязателен для Tailwind v4) |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS фреймворк |
| **PostCSS** | 8.5.6 | Процессор CSS (обработка Tailwind-директив) |
| **Autoprefixer** | 10.4.23 | Автоматическое добавление вендорных префиксов |
| **tailwindcss-animate** | 1.0.7 | Анимации для Tailwind (fade, slide и т.д.) |

### 2.2 Backend

| Библиотека | Версия | Назначение |
|---|---|---|
| **Express** | 5.2.1 | Веб-фреймворк для создания REST API |
| **Mongoose** | 9.1.5 | ODM для MongoDB (схемы, валидация, запросы) |
| **jsonwebtoken** | 9.0.2 | Создание и верификация JWT-токенов |
| **bcryptjs** | 2.4.3 | Хеширование паролей (алгоритм bcrypt) |
| **cors** | 2.8.6 | Разрешение кросс-доменных запросов от frontend |
| **dotenv** | 17.2.3 | Загрузка переменных окружения из `.env` файла |
| **multer** | 1.4.5-lts.1 | Обработка multipart/form-data (загрузка файлов) |

**Dev-зависимости:**

| Инструмент | Версия | Назначение |
|---|---|---|
| **nodemon** | 3.1.11 | Автоперезапуск сервера при изменении файлов |

### 2.3 База данных

| Технология | Назначение |
|---|---|
| **MongoDB** | NoSQL документоориентированная БД |
| **Mongoose** | ODM-слой для описания схем, валидации и построения запросов |

---

## 3. UI-компоненты и shadcn/ui

### 3.1 Статус shadcn/ui в проекте

В проекте **настроена инфраструктура** для shadcn/ui, но **фактические UI-компоненты не установлены**. Все элементы интерфейса реализованы как кастомные компоненты на Tailwind CSS.

**Конфигурация shadcn:**
- Файл `frontend/components.json` — конфигурация shadcn/ui присутствует
- Директория `frontend/src/components/ui/` — **не существует** (компоненты не генерировались)

**Установленные зависимости shadcn (peer dependencies):**

| Пакет | Назначение в контексте shadcn |
|---|---|
| `class-variance-authority` | Создание вариантных стилей (cva) — основа стилизации shadcn-компонентов |
| `clsx` | Условное объединение классов — используется внутри shadcn `cn()` утилиты |
| `tailwind-merge` | Слияние Tailwind-классов без конфликтов — используется в `cn()` |
| `lucide-react` | Иконки — shadcn использует их по умолчанию |
| `tailwindcss-animate` | Анимации — используются для переходов в компонентах |

Эти библиотеки установлены и используются в кастомных компонентах, но сами shadcn-компоненты (`Button`, `Dialog`, `Input` и т.д.) **не сгенерированы через CLI**.

### 3.2 Кастомные компоненты проекта

Вместо shadcn/ui весь интерфейс построен на собственных компонентах:

| Компонент | Путь | Назначение |
|---|---|---|
| **AppLayout** | `frontend/src/components/AppLayout.jsx` | Основной layout: sidebar (десктоп) + outlet (контент) + footer (мобильный) |
| **Sidebar** | `frontend/src/components/Sidebar.jsx` | Боковая навигация с иконками Lucide: Home, Search, Explore, Notifications, Create, Profile |
| **FeedPost** | `frontend/src/components/FeedPost.jsx` | Карточка поста в ленте: изображение, автор, лайки, комментарии, дата |
| **PostCreateModal** | `frontend/src/components/PostCreateModal.jsx` | Модальное окно создания поста: выбор файла, превью, описание, отправка |
| **PostModal** | `frontend/src/components/PostModal.jsx` | Модальное окно просмотра поста: изображение + детали + комментарии |
| **NotificationsList** | `frontend/src/components/NotificationsList.jsx` | Список уведомлений: аватар актора, текст действия, кнопка "прочитано" |

Все кнопки, инпуты, модалки и карточки реализованы инлайново через Tailwind-классы непосредственно в JSX.

### 3.3 Текущая реализация форм

В проекте все формы построены на **нативном HTML + useState**, без использования библиотек для работы с формами.

#### Паттерны, используемые в формах

**Паттерн 1 — Консолидированный объект формы + updateField:**
Используется в `Login.jsx`, `Register.jsx`, `ProfileEdit.jsx`.

```javascript
const [form, setForm] = useState({ email: "", username: "", password: "" });
const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });
// <input name="email" value={form.email} onChange={updateField} />
```

**Паттерн 2 — Отдельные useState для каждого поля:**
Используется в `Reset.jsx`, `ResetPassword.jsx`, `PostCreateModal.jsx`.

```javascript
const [password, setPassword] = useState("");
const [confirm, setConfirm] = useState("");
// <input value={password} onChange={(e) => setPassword(e.target.value)} />
```

#### Обзор форм по страницам

| Страница | Поля | Валидация клиент | Валидация сервер | Паттерн |
|---|---|---|---|---|
| `Login.jsx` | login, password | Нет | Да (400, 401) | Объект формы |
| `Register.jsx` | email, username, password, name | Нет | Да (400, 409) | Объект формы |
| `Reset.jsx` | identifier | Только пустота | Да | Отдельный useState |
| `ResetPassword.jsx` | password, confirm | Длина ≥ 8, совпадение полей | Да | Отдельные useState |
| `ProfileEdit.jsx` | name, username, email, bio + avatar (file) | maxLength на textarea | Да (400, 409, 403) | Объект формы + отдельный file |
| `PostCreateModal.jsx` | caption + image (file) | Наличие файла | Да (400, 401) | Отдельные useState |

#### Текущие проблемы форм

1. **Минимальная клиент-валидация** — почти вся валидация на сервере. Пользователь узнаёт об ошибке только после отправки.
2. **Нет единого подхода** — часть форм использует объект, часть — отдельные useState.
3. **Дублирование кода** — паттерн loading/error/submit повторяется в каждой форме.
4. **Нет real-time валидации** — ошибки не показываются по мере ввода (например, «пароль слишком короткий»).
5. **Нет валидации на уровне полей** — ошибки отображаются одним общим сообщением, а не под конкретным полем.

### 3.4 Миграция на shadcn/ui — анализ

#### Какие shadcn-компоненты заменят текущий код

| Текущая реализация | shadcn-компонент | Что даст |
|---|---|---|
| `<input className="...">` | `<Input />` | Единый стиль, состояния focus/error/disabled |
| `<textarea className="...">` | `<Textarea />` | Стилизация, auto-resize |
| `<button className="...">` | `<Button variant="..." />` | Варианты (primary, secondary, ghost, destructive), размеры, loading |
| Инлайновый `<div>` модалка | `<Dialog />` | Accessibility (focus trap, Escape, aria), анимация |
| Инлайновый `<div>` overlay | `<Dialog.Overlay />` | Затемнение фона с правильным z-index |
| `{error && <div>...}` | `<Alert variant="destructive" />` | Стандартный вид ошибок с иконкой |
| Кастомный dropdown | `<DropdownMenu />` | Клавиатурная навигация, позиционирование |
| Аватар с fallback | `<Avatar />` + `<AvatarFallback />` | Единый fallback при отсутствии изображения |
| Текст профиля | `<Card />` | Структурированные карточки |
| Загрузка `loading...` | `<Skeleton />` | Скелетон-анимация вместо текста |

#### Плюсы миграции на shadcn/ui

| Плюс | Пояснение |
|---|---|
| **Accessibility (a11y)** | Компоненты shadcn построены на Radix UI — встроенные aria-атрибуты, focus trap в модалках, клавиатурная навигация |
| **Консистентность UI** | Единая дизайн-система: все кнопки, инпуты, карточки выглядят одинаково |
| **Меньше CSS-кода** | Варианты через `cva` вместо длинных строк Tailwind-классов в каждом компоненте |
| **Темизация** | Встроенная поддержка тёмной темы через CSS-переменные |
| **Переиспользуемость** | Компоненты в `src/components/ui/` — импортируй и используй |
| **Уже есть инфраструктура** | `cva`, `clsx`, `tailwind-merge`, `lucide-react` уже установлены в проекте |
| **Полный контроль** | shadcn копирует код компонентов в проект — можно менять что угодно |
| **Типичный стек** | shadcn — де-факто стандарт для React + Tailwind проектов |

#### Минусы миграции на shadcn/ui

| Минус | Пояснение |
|---|---|
| **Объём работы** | Нужно переписать все страницы и компоненты — заменить инлайн-стили на shadcn-компоненты |
| **Новая зависимость: Radix UI** | shadcn использует `@radix-ui/*` пакеты — увеличение node_modules |
| **Кривая обучения** | Нужно изучить API компонентов (Dialog, DropdownMenu, Form и т.д.) |
| **Оверинжиниринг для простых случаев** | Для простой кнопки shadcn `<Button>` тянет `cva` + `cn()` — для проекта такого масштаба может быть избыточно |
| **Обновления вручную** | shadcn не npm-пакет — обновления нужно применять вручную через CLI |
| **Потенциальные конфликты стилей** | CSS-переменные shadcn могут конфликтовать с текущими глобальными стилями |

### 3.5 Формы — React Hook Form + shadcn vs текущий подход

#### Вариант 1: Текущий подход (useState)

```
Плюсы:                              Минусы:
+ Нет дополнительных зависимостей   - Дублирование кода в каждой форме
+ Простота понимания                - Нет real-time валидации
+ Полный контроль                   - Ошибки только после submit
                                    - Нет валидации на уровне полей
                                    - Ручное управление touched/dirty
```

#### Вариант 2: React Hook Form (react-hook-form)

```
Плюсы:                              Минусы:
+ Минимальные ре-рендеры            - Новая зависимость (~8KB gzip)
  (uncontrolled inputs)
+ Встроенная валидация              - Кривая обучения (register, watch,
  (required, min, max, pattern,       handleSubmit, formState)
  validate — кастомная функция)
+ Ошибки на уровне полей           - Нужно переписать все формы
+ Состояния: dirty, touched,
  isSubmitting, isValid
+ Лёгкий (~8KB gzip)
+ Не требует дополнительных
  библиотек валидации
```

React Hook Form имеет **встроенную систему валидации** через объект `rules` в `register()`. Этого достаточно для всех форм проекта без каких-либо дополнительных зависимостей.

#### Встроенные правила валидации React Hook Form

| Правило | Пример | Что проверяет |
|---|---|---|
| `required` | `required: "Обязательное поле"` | Поле не пустое |
| `minLength` | `minLength: {value: 8, message: "Мин. 8 символов"}` | Минимальная длина |
| `maxLength` | `maxLength: {value: 160, message: "Макс. 160 символов"}` | Максимальная длина |
| `pattern` | `pattern: {value: /regex/, message: "Неверный формат"}` | Соответствие регулярному выражению |
| `validate` | `validate: (v) => v === watch("password") \|\| "Пароли не совпадают"` | Любая кастомная логика |
| `min` / `max` | `min: {value: 1, message: "..."}` | Числовые диапазоны |

#### Сравнение на примере формы логина

**Текущий подход (Login.jsx):**
```jsx
const [form, setForm] = useState({ login: "", password: "" });
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    await login(/* ... */);
    navigate("/");
  } catch (err) {
    setError(err.status === 401 ? "Wrong credentials" : "Error");
  } finally {
    setLoading(false);
  }
};

<form onSubmit={handleSubmit}>
  <input name="login" value={form.login} onChange={updateField} />
  <input name="password" value={form.password} onChange={updateField} />
  {error && <div className="text-red-500">{error}</div>}
  <button disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
</form>
```

**React Hook Form (без Zod, встроенная валидация):**
```jsx
import { useForm } from "react-hook-form";

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting }
} = useForm();

const onSubmit = async (data) => {
  try {
    const isEmail = data.login.includes("@");
    await login(isEmail ? { email: data.login } : { username: data.login }, data.password);
    navigate("/");
  } catch (err) {
    setError(err.status === 401 ? "Wrong credentials" : "Error");
  }
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input
    {...register("login", {
      required: "Введите email или username"
    })}
  />
  {errors.login && <span className="text-red-500">{errors.login.message}</span>}

  <input
    type="password"
    {...register("password", {
      required: "Введите пароль",
      minLength: { value: 8, message: "Минимум 8 символов" }
    })}
  />
  {errors.password && <span className="text-red-500">{errors.password.message}</span>}

  <button disabled={isSubmitting}>
    {isSubmitting ? "Вход..." : "Войти"}
  </button>
</form>
```

**Что изменилось:**
- `useState` для формы → `register()` (uncontrolled inputs — меньше ре-рендеров)
- `useState` для loading → `formState.isSubmitting` (автоматическое отслеживание)
- Нет клиент-валидации → `required`, `minLength` с сообщениями ошибок
- Одна общая ошибка → ошибки **под каждым полем** через `errors.fieldName.message`
- `e.preventDefault()` → `handleSubmit()` делает это автоматически

#### Пример: форма регистрации (React Hook Form)

```jsx
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email", {
    required: "Введите email",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Неверный формат email"
    }
  })} />
  {errors.email && <span>{errors.email.message}</span>}

  <input {...register("username", {
    required: "Введите username",
    minLength: { value: 3, message: "Минимум 3 символа" },
    maxLength: { value: 30, message: "Максимум 30 символов" }
  })} />
  {errors.username && <span>{errors.username.message}</span>}

  <input type="password" {...register("password", {
    required: "Введите пароль",
    minLength: { value: 8, message: "Минимум 8 символов" }
  })} />
  {errors.password && <span>{errors.password.message}</span>}

  <input {...register("name")} />  {/* необязательное поле — без правил */}
</form>
```

#### Пример: сброс пароля с validate (совпадение полей)

```jsx
const { register, handleSubmit, watch, formState: { errors } } = useForm();

<input type="password" {...register("password", {
  required: "Введите пароль",
  minLength: { value: 8, message: "Минимум 8 символов" }
})} />

<input type="password" {...register("confirm", {
  required: "Подтвердите пароль",
  validate: (value) =>
    value === watch("password") || "Пароли не совпадают"
})} />
{errors.confirm && <span>{errors.confirm.message}</span>}
```

`validate` — кастомная функция валидации. Заменяет Zod `.refine()` без дополнительных зависимостей.

#### Рекомендация

| Форма | Рекомендуемый подход | Обоснование |
|---|---|---|
| `Login.jsx` | React Hook Form | 2 поля, `required` + `minLength` достаточно |
| `Register.jsx` | React Hook Form | 4 поля, `pattern` для email, `minLength`/`maxLength` для username |
| `ResetPassword.jsx` | React Hook Form | `validate` для совпадения паролей — встроенная функция |
| `Reset.jsx` | Оставить useState | Одно поле — React Hook Form избыточен |
| `ProfileEdit.jsx` | React Hook Form | 4 текстовых поля, `pattern` для email, `maxLength` для bio |
| `PostCreateModal.jsx` | Оставить useState | Одно текстовое поле + файл — простая логика |

#### Необходимые пакеты для миграции

```bash
# shadcn/ui компоненты (генерация через CLI)
npx shadcn@latest add button input textarea dialog alert avatar card skeleton

# React Hook Form (без Zod — встроенная валидация)
npm install react-hook-form
```

**Не нужны:** `zod`, `@hookform/resolvers` — встроенных правил валидации RHF достаточно для всех форм проекта.

#### План миграции по этапам

```
Этап 1: Базовые UI-компоненты
  └── npx shadcn@latest add button input textarea
  └── Заменить <button> и <input> на shadcn-версии во всех страницах

Этап 2: Модальные окна
  └── npx shadcn@latest add dialog
  └── Переписать PostCreateModal.jsx и PostModal.jsx

Этап 3: Формы
  └── npm install react-hook-form
  └── Переписать Login, Register, ResetPassword, ProfileEdit
  └── Для каждой формы: useState → useForm(), правила в register()

Этап 4: Дополнительные компоненты
  └── npx shadcn@latest add avatar card skeleton alert dropdown-menu
  └── Обновить Profile, FeedPost, NotificationsList
```

---

## 4. Архитектура

### 4.1 Общая архитектура

```
┌─────────────────────┐         HTTP/REST          ┌─────────────────────┐
│                     │  ◄─────────────────────►   │                     │
│   Frontend (React)  │    JSON + FormData          │   Backend (Express) │
│   localhost:5173    │                             │   localhost:4000    │
│                     │   Authorization: Bearer     │                     │
└─────────────────────┘                             └──────────┬──────────┘
                                                               │
                                                               │ Mongoose
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │                     │
                                                    │   MongoDB           │
                                                    │   localhost:27017   │
                                                    │   DB: ichgramm     │
                                                    │                     │
                                                    └─────────────────────┘
```

### 4.2 Архитектура Backend

Backend построен по паттерну **MVC (Model-View-Controller)** без слоя View (его роль выполняет frontend):

```
Запрос от клиента
        │
        ▼
   ┌─────────┐
   │ Routes   │  ── Определяет URL и HTTP-метод, подключает middleware и контроллер
   └────┬─────┘
        │
        ▼
 ┌──────────────┐
 │ Middlewares   │  ── auth (проверка JWT), upload (обработка файлов), optionalAuth
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ Controllers  │  ── Бизнес-логика: валидация, CRUD-операции, формирование ответа
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │ Models       │  ── Mongoose-схемы: структура документов, индексы, хуки
 └──────┬───────┘
        │
        ▼
    MongoDB
```

### 4.3 Архитектура Frontend

Frontend построен как **SPA (Single Page Application)** с компонентной архитектурой:

```
main.jsx (точка входа)
    │
    ▼
App.jsx (маршрутизация)
    │
    ├── Публичные маршруты
    │   ├── /login        → Login.jsx
    │   ├── /register     → Register.jsx
    │   ├── /reset        → Reset.jsx
    │   └── /reset-password → ResetPassword.jsx
    │
    └── Защищённые маршруты (ProtectedRoute)
        │
        └── AppLayout (Sidebar + контент + FooterNav)
            ├── /             → Feed.jsx
            ├── /explore      → Explore.jsx
            ├── /posts/new    → PostCreate.jsx
            ├── /post/:id     → PostDetail.jsx
            ├── /profile/:id  → Profile.jsx
            ├── /profile/:id/edit → ProfileEdit.jsx
            ├── /profile/:id/followers → Followers.jsx
            ├── /profile/:id/following → Following.jsx
            └── /notifications → Notifications.jsx
```

### 4.4 Управление состоянием

Глобальное состояние управляется через **React Context API**:

```
AuthProvider (AuthContext.jsx)
    │
    ├── Состояние: token, user, loading, error
    ├── Методы: login(), register(), logout(), updateUser()
    └── Хук: useAuth()
        │
        ▼
    Все компоненты через useAuth() получают доступ к:
    ├── user — текущий пользователь
    ├── token — JWT токен
    ├── login(email, password) — авторизация
    ├── register(data) — регистрация
    ├── logout() — выход
    └── updateUser(data) — обновление профиля
```

Локальное состояние страниц управляется через `useState` и `useEffect`.

---

## 5. Структура проекта

### 5.1 Корневая директория

```
FINAL/
├── backend/          # Серверная часть (Node.js + Express)
├── frontend/         # Клиентская часть (React + Vite)
├── docs/             # Документация проекта
├── package.json      # Корневой конфиг (workspace)
├── package-lock.json # Lockfile зависимостей
└── run.json          # Конфигурация запуска
```

### 5.2 Backend — Детальная структура

```
backend/
├── .env                          # Переменные окружения (порт, JWT-секрет, URI БД)
├── package.json                  # Зависимости и скрипты
└── src/
    ├── server.js                 # Точка входа: подключение к БД и запуск сервера
    ├── app.js                    # Конфигурация Express: CORS, парсинг JSON, роуты, обработка ошибок
    │
    ├── utils/
    │   └── db.js                 # Подключение к MongoDB через mongoose.connect()
    │
    ├── models/                   # Mongoose-схемы (структура данных в БД)
    │   ├── User.js               # Пользователь: email, username, password, bio, avatar
    │   ├── Post.js               # Пост: authorId, image (base64), caption
    │   ├── Comment.js            # Комментарий: userId, postId, text
    │   ├── Like.js               # Лайк: userId, postId (уникальная пара)
    │   ├── Follow.js             # Подписка: followerId, followingId (уникальная пара)
    │   ├── Notification.js       # Уведомление: userId, actorId, type, entityId, read
    │   └── Message.js            # Сообщение: roomId, senderId, text (не реализовано на фронте)
    │
    ├── middlewares/               # Промежуточные обработчики запросов
    │   ├── auth.js               # Обязательная JWT-авторизация: проверяет токен, ставит req.userId
    │   ├── optionalAuth.js       # Опциональная авторизация: ставит req.userId если токен есть
    │   └── upload.js             # Multer: обработка загрузки изображений (memory storage, лимит 5МБ)
    │
    ├── controllers/              # Бизнес-логика обработки запросов
    │   ├── authController.js     # Регистрация, логин, /me, сброс пароля
    │   ├── usersController.js    # Профиль, обновление профиля, аватар, посты пользователя
    │   ├── postsController.js    # CRUD постов, лента с пагинацией
    │   ├── likesController.js    # Тогл лайка (поставить/убрать)
    │   ├── commentsController.js # Создание и получение комментариев
    │   ├── followController.js   # Тогл подписки, списки подписчиков/подписок
    │   ├── searchController.js   # Поиск пользователей по username/name
    │   ├── exploreController.js  # Случайные посты ($sample)
    │   └── notificationsController.js # Получение и пометка уведомлений
    │
    └── routes/                   # Маршруты API
        ├── authRoutes.js         # /api/auth/*
        ├── usersRoutes.js        # /api/users/* (включая follow, followers, following)
        ├── postsRoutes.js        # /api/posts/* (включая like, comments)
        ├── searchRoutes.js       # /api/search/*
        ├── exploreRoutes.js      # /api/explore/*
        └── notificationsRoutes.js # /api/notifications/*
```

### 5.3 Frontend — Детальная структура

```
frontend/
├── .env                          # VITE_API_BASE_URL
├── index.html                    # HTML-шаблон (точка входа Vite)
├── package.json                  # Зависимости и скрипты
├── vite.config.js                # Конфигурация Vite
├── postcss.config.js             # PostCSS плагины (Tailwind, Autoprefixer)
└── src/
    ├── main.jsx                  # Точка входа React: рендерит <App/> в DOM
    ├── App.jsx                   # Маршрутизация: все роуты приложения
    ├── index.css                 # Глобальные стили + Tailwind директивы
    │
    ├── auth/                     # Модуль аутентификации
    │   ├── AuthContext.jsx       # React Context для авторизации (token, user, login, logout)
    │   └── ProtectedRoute.jsx   # HOC: редирект на /login если нет токена
    │
    ├── lib/                      # Утилиты
    │   └── apiClient.js          # HTTP-обёртка: автоподстановка токена, обработка ошибок
    │
    ├── components/               # Переиспользуемые компоненты
    │   ├── AppLayout.jsx         # Основной layout: sidebar + outlet + mobile footer
    │   ├── Sidebar.jsx           # Боковая навигация (десктоп) с иконками
    │   ├── FeedPost.jsx          # Карточка поста в ленте (изображение, лайки, комментарии)
    │   ├── PostCreateModal.jsx   # Модальное окно создания поста
    │   ├── PostModal.jsx         # Модальное окно просмотра поста
    │   └── NotificationsList.jsx # Список уведомлений (панель/страница)
    │
    └── pages/                    # Страницы приложения
        ├── Login.jsx             # Страница входа
        ├── Register.jsx          # Страница регистрации
        ├── Reset.jsx             # Запрос на сброс пароля
        ├── ResetPassword.jsx     # Форма установки нового пароля
        ├── Feed.jsx              # Главная лента постов
        ├── Explore.jsx           # Обзор случайных постов (сетка)
        ├── Profile.jsx           # Профиль пользователя
        ├── ProfileEdit.jsx       # Редактирование профиля
        ├── PostCreate.jsx        # Создание поста (страница)
        ├── PostDetail.jsx        # Детальный просмотр поста с комментариями
        ├── Followers.jsx         # Список подписчиков
        ├── Following.jsx         # Список подписок
        ├── Notifications.jsx     # Страница уведомлений
        └── NotFound.jsx          # Страница 404
```

---

## 6. База данных

### 6.1 Коллекции (таблицы) и их назначение

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MongoDB: ichgramm                           │
├─────────────────┬───────────────────────────────────────────────────┤
│ Коллекция       │ Назначение                                        │
├─────────────────┼───────────────────────────────────────────────────┤
│ users           │ Профили пользователей (email, username, пароль)   │
│ posts           │ Публикации (изображение, описание, автор)         │
│ comments        │ Комментарии к постам                              │
│ likes           │ Лайки постов (кто какой пост лайкнул)            │
│ follows         │ Подписки (кто на кого подписан)                  │
│ notifications   │ Уведомления (лайки, комментарии, подписки)       │
│ messages        │ Сообщения (подготовлено, не реализовано)          │
└─────────────────┴───────────────────────────────────────────────────┘
```

### 6.2 Схемы коллекций

#### Users
```
{
  _id:                    ObjectId (автогенерация)
  email:                  String, unique, required   — email с regex-валидацией
  username:               String, unique, required   — от 3 до 30 символов
  password:               String, required           — bcrypt-хеш (select: false)
  name:                   String                     — отображаемое имя
  bio:                    String                     — описание профиля (макс. 160 символов)
  avatar:                 String                     — base64 data URL изображения
  resetPasswordTokenHash: String                     — SHA256-хеш токена сброса пароля
  resetPasswordExpiresAt: Date                       — срок действия токена сброса
  createdAt:              Date (auto)
  updatedAt:              Date (auto)
}
```

**Хук pre-save:** Автоматически хеширует пароль через bcrypt (10 раундов) при создании/изменении.
**Метод:** `comparePassword(candidate)` — сравнение пароля с хешем.

#### Posts
```
{
  _id:       ObjectId
  authorId:  ObjectId → users._id (indexed)   — автор поста
  image:     String, required                  — base64 data URL изображения
  caption:   String                            — описание (макс. 2200 символов)
  createdAt: Date (indexed, desc)
  updatedAt: Date
}
```

#### Comments
```
{
  _id:       ObjectId
  userId:    ObjectId → users._id (indexed)    — автор комментария
  postId:    ObjectId → posts._id (indexed)    — к какому посту
  text:      String, required                  — текст (макс. 500 символов)
  createdAt: Date (indexed, desc)
  updatedAt: Date
}
```

#### Likes
```
{
  _id:       ObjectId
  userId:    ObjectId → users._id (indexed)    — кто поставил лайк
  postId:    ObjectId → posts._id (indexed)    — какому посту
  createdAt: Date
  updatedAt: Date
}
```

**Уникальный составной индекс:** `{userId: 1, postId: 1}` — один пользователь может поставить только один лайк одному посту.

#### Follows
```
{
  _id:          ObjectId
  followerId:   ObjectId → users._id (indexed)  — кто подписался
  followingId:  ObjectId → users._id (indexed)  — на кого подписались
  createdAt:    Date
  updatedAt:    Date
}
```

**Уникальный составной индекс:** `{followerId: 1, followingId: 1}` — предотвращает дублирование подписок.

#### Notifications
```
{
  _id:       ObjectId
  userId:    ObjectId → users._id (indexed)    — кому адресовано
  actorId:   ObjectId → users._id (indexed)    — кто совершил действие
  type:      String, enum: ["like", "comment", "follow"]
  entityId:  ObjectId (indexed)                — ID связанной сущности (post/comment/user)
  read:      Boolean, default: false (indexed) — прочитано ли
  createdAt: Date (indexed, desc)
  updatedAt: Date
}
```

#### Messages (подготовлено, не реализовано на frontend)
```
{
  _id:       ObjectId
  roomId:    String (indexed)                  — ID комнаты чата
  senderId:  ObjectId → users._id (indexed)   — отправитель
  text:      String, required                  — текст (макс. 2000 символов)
  createdAt: Date (indexed, desc)
  updatedAt: Date
}
```

### 6.3 Связи между коллекциями

```
                    ┌──────────┐
           ┌───────│  users    │───────┐
           │       └────┬─────┘       │
           │            │              │
     followerId    authorId/userId   followingId
     senderId      actorId/userId
           │            │              │
           ▼            ▼              ▼
    ┌──────────┐ ┌──────────┐  ┌──────────┐
    │ follows  │ │  posts   │  │ messages │
    └──────────┘ └────┬─────┘  └──────────┘
                      │
              postId  │  postId
                      │
              ┌───────┴───────┐
              ▼               ▼
        ┌──────────┐   ┌──────────┐
        │  likes   │   │ comments │
        └──────────┘   └──────────┘
                              │
                     ┌────────┘
                     ▼
              ┌──────────────┐
              │ notifications│ ◄── entityId → post/comment/user
              └──────────────┘

Связи (все через ObjectId ref):
• posts.authorId        → users._id       (автор поста)
• comments.userId       → users._id       (автор комментария)
• comments.postId       → posts._id       (к какому посту)
• likes.userId          → users._id       (кто лайкнул)
• likes.postId          → posts._id       (какой пост)
• follows.followerId    → users._id       (подписчик)
• follows.followingId   → users._id       (на кого подписан)
• notifications.userId  → users._id       (получатель)
• notifications.actorId → users._id       (инициатор)
• notifications.entityId→ posts/comments/users._id (связанная сущность)
• messages.senderId     → users._id       (отправитель)
```

---

## 7. Аутентификация и авторизация

### 7.1 Схема аутентификации

```
Регистрация:
┌──────────┐   POST /api/auth/register    ┌──────────┐   bcrypt.hash()   ┌──────────┐
│ Frontend │ ────────────────────────────► │ Backend  │ ────────────────► │ MongoDB  │
│          │   {email,username,password}   │          │   сохранение     │          │
│          │ ◄──────────────────────────── │          │ ◄──────────────── │          │
└──────────┘   {token, user}              └──────────┘                   └──────────┘
     │
     │ localStorage.setItem("token", token)
     ▼

Логин:
┌──────────┐   POST /api/auth/login       ┌──────────┐   bcrypt.compare() ┌──────────┐
│ Frontend │ ────────────────────────────► │ Backend  │ ─────────────────► │ MongoDB  │
│          │   {email/username, password}  │          │   проверка хеша   │          │
│          │ ◄──────────────────────────── │          │ ◄───────────────── │          │
└──────────┘   {token, user}              └──────────┘                    └──────────┘
     │
     │ localStorage.setItem("token", token)
     ▼

Защищённый запрос:
┌──────────┐   GET /api/posts              ┌──────────┐
│ Frontend │ ───────────────────────────►  │ Backend  │
│          │   Authorization: Bearer JWT   │          │
│          │                               │ auth.js: │
│          │                               │ jwt.verify() → req.userId
└──────────┘                               └──────────┘
```

### 7.2 Middleware авторизации

**auth.js** — обязательная авторизация:
1. Извлекает токен из заголовка `Authorization: Bearer <token>`
2. Верифицирует JWT через `jwt.verify(token, JWT_SECRET)`
3. Извлекает `sub` (userId) из payload
4. Устанавливает `req.userId = sub`
5. Если токен невалидный или отсутствует → 401 Unauthorized

**optionalAuth.js** — опциональная авторизация:
1. Если заголовок `Authorization` есть — проверяет JWT и ставит `req.userId`
2. Если заголовка нет — пропускает без ошибки (`req.userId = undefined`)
3. Используется на эндпоинтах, где авторизованный пользователь получает дополнительную информацию (например, `liked: true`)

### 7.3 Сброс пароля

```
1. POST /api/auth/forgot-password  {identifier: "email или username"}
   │
   ├── Генерация случайного токена (crypto.randomBytes)
   ├── Хеширование токена через SHA256 → сохранение хеша в User
   ├── Установка срока истечения: 15 минут
   └── Вывод ссылки в console (dev-режим):
       http://localhost:5173/reset-password?token=<rawToken>

2. POST /api/auth/reset-password  {token, password}
   │
   ├── Хеширование полученного токена → SHA256
   ├── Поиск User с совпадающим хешем и неистёкшим сроком
   ├── Установка нового пароля (pre-save хук хеширует автоматически)
   └── Очистка полей resetPasswordTokenHash и resetPasswordExpiresAt
```

---

## 8. Поток данных

### 8.1 Общая схема взаимодействия

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                           │
│                                                                     │
│  Пользователь                                                       │
│      │                                                              │
│      │ действие (клик, ввод)                                        │
│      ▼                                                              │
│  Компонент (useState, useEffect)                                    │
│      │                                                              │
│      │ вызов apiClient.request(path, options)                       │
│      ▼                                                              │
│  apiClient.js                                                       │
│      │                                                              │
│      ├── Читает token из localStorage                               │
│      ├── Устанавливает заголовок Authorization: Bearer <token>      │
│      ├── Устанавливает Content-Type (JSON или FormData)             │
│      └── fetch(API_BASE + path, options)                            │
│                                                                     │
└─────────┬───────────────────────────────────────────────────────────┘
          │ HTTP Request (JSON / FormData)
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Express)                           │
│                                                                     │
│  app.js: CORS → express.json() → Routes                            │
│      │                                                              │
│      ▼                                                              │
│  Route → Middleware(s) → Controller                                 │
│      │                                                              │
│      │  Controller:                                                  │
│      │  1. Валидация входных данных                                  │
│      │  2. Запрос к MongoDB через Mongoose Model                    │
│      │  3. Бизнес-логика (создание уведомления, подсчёт и т.д.)     │
│      │  4. Формирование JSON-ответа                                  │
│      ▼                                                              │
│  res.status(200).json({ data })                                     │
│                                                                     │
└─────────┬───────────────────────────────────────────────────────────┘
          │ HTTP Response (JSON)
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                           │
│                                                                     │
│  apiClient.js                                                       │
│      │                                                              │
│      ├── Проверяет res.ok                                           │
│      ├── Парсит JSON                                                │
│      └── Возвращает data или выбрасывает ошибку                     │
│      │                                                              │
│      ▼                                                              │
│  Компонент                                                          │
│      │                                                              │
│      ├── setState(data)  → перерендер UI                            │
│      └── catch(error) → отображение ошибки                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Взаимодействие сервера с базой данных

```
Controller                        Mongoose                          MongoDB
    │                                │                                 │
    │  User.findById(id)             │                                 │
    │ ──────────────────────────►    │                                 │
    │                                │  db.users.findOne({_id: id})    │
    │                                │ ──────────────────────────────► │
    │                                │ ◄────────────────────────────── │
    │ ◄──────────────────────────    │  document                       │
    │  JS-объект (User instance)     │                                 │
    │                                │                                 │
    │  Post.aggregate([pipeline])    │                                 │
    │ ──────────────────────────►    │                                 │
    │                                │  db.posts.aggregate(pipeline)   │
    │                                │ ──────────────────────────────► │
    │                                │ ◄────────────────────────────── │
    │ ◄──────────────────────────    │  результат агрегации            │
    │  массив JS-объектов            │                                 │
```

Mongoose выполняет:
- **Валидацию** данных перед записью (required, maxlength, enum, regex)
- **Преобразование типов** (String → ObjectId при ссылках)
- **Выполнение хуков** (pre-save для хеширования пароля)
- **Populate** — подтягивание связанных документов (аналог JOIN)
- **Aggregate** — сложные запросы с группировкой, подсчётом и соединением коллекций

---

## 9. Посты, лайки, комментарии

### 9.1 Создание поста

```
Пользователь                    Frontend                        Backend                        MongoDB
    │                              │                               │                              │
    │ Нажимает "Создать"           │                               │                              │
    │ ──────────────────►          │                               │                              │
    │                              │ Открывает PostCreateModal     │                              │
    │ Выбирает изображение         │                               │                              │
    │ ──────────────────►          │                               │                              │
    │                              │ URL.createObjectURL(file)     │                              │
    │ Видит превью                 │ → показывает превью           │                              │
    │                              │                               │                              │
    │ Вводит описание              │                               │                              │
    │ Нажимает "Поделиться"        │                               │                              │
    │ ──────────────────►          │                               │                              │
    │                              │ FormData: image + caption     │                              │
    │                              │ POST /api/posts               │                              │
    │                              │ ─────────────────────────►    │                              │
    │                              │                               │ Multer: buffer в память       │
    │                              │                               │ buffer → base64 data URL      │
    │                              │                               │ Post.create({                 │
    │                              │                               │   authorId, image, caption    │
    │                              │                               │ })                            │
    │                              │                               │ ─────────────────────────►    │
    │                              │                               │ ◄─────────────────────────    │
    │                              │ ◄─────────────────────────    │ {post}                        │
    │                              │ Навигация на /post/{id}       │                              │
    │ Видит свой пост              │                               │                              │
```

**Как работает:**
1. Пользователь выбирает изображение через `<input type="file">`.
2. Для мгновенного превью создаётся `URL.createObjectURL(file)`.
3. При отправке файл упаковывается в `FormData`.
4. На сервере middleware `multer` сохраняет файл в оперативную память (memory storage).
5. Контроллер конвертирует buffer в base64 строку формата `data:image/jpeg;base64,...`.
6. Создаётся документ Post в MongoDB с base64-строкой изображения.
7. Frontend получает созданный пост и перенаправляет пользователя.

### 9.2 Лайк поста

```
Пользователь         Frontend                    Backend                      MongoDB
    │                   │                            │                           │
    │ Нажимает ❤        │                            │                           │
    │ ────────►         │                            │                           │
    │                   │ POST /api/posts/:id/like   │                           │
    │                   │ ──────────────────────►     │                           │
    │                   │                            │ Like.findOne({userId,     │
    │                   │                            │   postId})                │
    │                   │                            │ ──────────────────────►   │
    │                   │                            │ ◄──────────────────────   │
    │                   │                            │                           │
    │                   │                            │ Если лайк ЕСТЬ:          │
    │                   │                            │   Like.deleteOne()        │
    │                   │                            │   liked = false           │
    │                   │                            │                           │
    │                   │                            │ Если лайка НЕТ:          │
    │                   │                            │   Like.create({userId,   │
    │                   │                            │     postId})             │
    │                   │                            │   liked = true           │
    │                   │                            │                           │
    │                   │                            │   Если userId ≠ authorId:│
    │                   │                            │     Notification.create({│
    │                   │                            │       userId: authorId,  │
    │                   │                            │       actorId: userId,   │
    │                   │                            │       type: "like",      │
    │                   │                            │       entityId: postId   │
    │                   │                            │     })                   │
    │                   │                            │                           │
    │                   │                            │ likesCount = Like.count() │
    │                   │ ◄──────────────────────     │ {liked, likesCount}      │
    │                   │ Обновляет UI:              │                           │
    │                   │ ❤ → красное/пустое         │                           │
    │                   │ счётчик лайков             │                           │
    │ Видит обновление  │                            │                           │
```

**Как работает:**
1. Лайк реализован как **toggle** (переключатель): один запрос ставит или убирает лайк.
2. Backend проверяет, существует ли документ Like с данными `userId` и `postId`.
3. Если существует — удаляет (unlike), если нет — создаёт (like).
4. Уникальный составной индекс `{userId, postId}` гарантирует невозможность двойного лайка.
5. При новом лайке создаётся уведомление для автора поста (если лайкает не автор).
6. Возвращается текущее состояние (`liked`) и общее количество лайков.

### 9.3 Комментарии

```
Пользователь         Frontend                        Backend                      MongoDB
    │                   │                                │                           │
    │ Пишет текст       │                                │                           │
    │ Нажимает отправку │                                │                           │
    │ ────────►         │                                │                           │
    │                   │ POST /api/posts/:id/comments   │                           │
    │                   │ {text: "Отличное фото!"}       │                           │
    │                   │ ──────────────────────────►     │                           │
    │                   │                                │ Валидация: text required,  │
    │                   │                                │ max 500 символов           │
    │                   │                                │                            │
    │                   │                                │ Comment.create({           │
    │                   │                                │   userId, postId, text     │
    │                   │                                │ })                         │
    │                   │                                │ ──────────────────────►    │
    │                   │                                │ ◄──────────────────────    │
    │                   │                                │                            │
    │                   │                                │ comment.populate("userId") │
    │                   │                                │ → подтягивает username,    │
    │                   │                                │   name, avatar             │
    │                   │                                │                            │
    │                   │                                │ Если userId ≠ authorId:    │
    │                   │                                │   Notification.create({    │
    │                   │                                │     type: "comment",       │
    │                   │                                │     entityId: commentId    │
    │                   │                                │   })                       │
    │                   │                                │                            │
    │                   │ ◄──────────────────────────     │ {comment}                 │
    │                   │ Добавляет комментарий в список │                            │
    │ Видит комментарий │                                │                            │
```

**Как работает:**
1. Пользователь вводит текст комментария (максимум 500 символов).
2. Frontend отправляет POST-запрос с `{text}`.
3. Backend создаёт документ Comment, связывая userId и postId.
4. Через `populate("userId")` подтягиваются данные автора комментария (username, avatar).
5. Если комментатор — не автор поста, создаётся уведомление типа "comment".
6. Frontend получает полный объект комментария с данными автора и добавляет его в список.

### 9.4 Лента постов (Feed)

```
Frontend                            Backend                               MongoDB
    │                                  │                                     │
    │ GET /api/posts?page=1&limit=10   │                                     │
    │ ────────────────────────────►     │                                     │
    │                                  │ Post.aggregate([                    │
    │                                  │   $match: username ≠ "itcareerhub" │
    │                                  │   $sort: {createdAt: -1}           │
    │                                  │   $skip: (page-1)*limit            │
    │                                  │   $limit: limit                    │
    │                                  │   $lookup: users (authorId)        │
    │                                  │   $lookup: likes (подсчёт)         │
    │                                  │   $lookup: comments (подсчёт)      │
    │                                  │ ])                                  │
    │                                  │ ──────────────────────────────►     │
    │                                  │ ◄──────────────────────────────     │
    │ ◄────────────────────────────     │                                    │
    │ {items, page, limit, total}      │                                    │
    │                                  │                                     │
    │ Рендерит FeedPost для каждого    │                                    │
    │ элемента items                   │                                    │
```

Используется **MongoDB Aggregation Pipeline** для эффективного получения постов с данными авторов и подсчётами лайков/комментариев в одном запросе.

---

## 10. Подписки — детальная реализация

### 10.1 Обзор механизма подписок

Система подписок позволяет пользователям подписываться друг на друга. Реализована как **toggle** (переключатель): один и тот же эндпоинт выполняет и подписку, и отписку.

**Задействованные файлы:**

| Файл | Назначение |
|---|---|
| `backend/src/models/Follow.js` | Mongoose-схема подписки |
| `backend/src/controllers/followController.js` | Бизнес-логика: toggle, списки |
| `backend/src/routes/usersRoutes.js` | Маршруты `/users/:id/follow`, `/followers`, `/following` |
| `frontend/src/pages/Profile.jsx` | Кнопка Follow/Following и отображение счётчиков |
| `frontend/src/pages/Followers.jsx` | Страница списка подписчиков |
| `frontend/src/pages/Following.jsx` | Страница списка подписок |

### 10.2 Backend — Контроллер подписок

**Файл:** `backend/src/controllers/followController.js`

#### toggleFollow() — POST `/api/users/:id/follow`

```
Запрос приходит
    │
    ▼
1. Проверка: req.userId === req.params.id?
   │
   ├── Да → 400 "Cannot follow yourself"
   │
   └── Нет → продолжаем
        │
        ▼
2. Проверка: целевой пользователь существует?
   │
   ├── Нет → 404 "User not found"
   │
   └── Да → продолжаем
        │
        ▼
3. Follow.findOne({followerId: req.userId, followingId: id})
   │
   ├── Найден → Follow.deleteOne()
   │             following = false
   │
   └── Не найден → Follow.create({followerId, followingId})
                    following = true
                    │
                    └── Notification.create({
                          userId: followingId,     // кому: целевой пользователь
                          actorId: followerId,     // кто: текущий пользователь
                          type: "follow",
                          entityId: followerId     // ссылка на подписчика
                        })
        │
        ▼
4. Подсчёт:
   followersCount  = Follow.countDocuments({followingId: id})
   followingCount  = Follow.countDocuments({followerId: id})
        │
        ▼
5. Ответ: {following, followersCount, followingCount}
```

**Обработка ошибок:**
- `ValidationError` (Mongoose) → 400 с деталями
- Дублирующая подписка (код 11000) → 409 "Already following"
- Прочие ошибки → 500

#### listFollowers() — GET `/api/users/:id/followers`

```
1. Пагинация: page (default 1), limit (default 20, max 50)
2. Follow.find({followingId: id})
     .populate("followerId", "username avatar name")
     .sort({createdAt: -1})
     .skip((page-1) * limit)
     .limit(limit)
3. Ответ: {items: [{followerId: {_id, username, avatar, name}, ...}], page, limit, total}
```

#### listFollowing() — GET `/api/users/:id/following`

```
1. Аналогично listFollowers, но:
   Follow.find({followerId: id})
     .populate("followingId", "username avatar name")
2. Ответ: {items: [{followingId: {_id, username, avatar, name}, ...}], page, limit, total}
```

### 10.3 Frontend — Кнопка подписки (Profile.jsx)

**Файл:** `frontend/src/pages/Profile.jsx`

**Состояние:**
```javascript
const [stats, setStats] = useState({
  posts: 0,
  followers: 0,
  following: 0,
  isFollowing: false   // ◄── определяет текст и цвет кнопки
});
const [followLoading, setFollowLoading] = useState(false);
const isOwner = me && profile && String(me._id) === String(profile._id);
```

**Логика кнопки:**
```
Клик на кнопку "Follow" / "Following"
    │
    ▼
handleToggleFollow()
    │
    ├── Guard: если followLoading или isOwner → выход
    │
    ├── setFollowLoading(true) → кнопка disabled
    │
    ├── POST /api/users/:id/follow
    │       │
    │       ▼
    │   Ответ: {following, followersCount, followingCount}
    │       │
    │       ▼
    │   setStats(prev => ({
    │     ...prev,
    │     isFollowing: Boolean(data.following),
    │     followers: data.followersCount ?? prev.followers,
    │     following: data.followingCount ?? prev.following
    │   }))
    │
    ├── catch → setError(message)
    │
    └── finally → setFollowLoading(false)
```

**Отображение кнопки:**
```
Если isOwner:
  → Ссылка "Edit profile" на /profile/:id/edit

Если НЕ isOwner:
  ┌─────────────────────────────────────────────────┐
  │  isFollowing === true:                          │
  │    Фон: #EFEFEF (серый)                         │
  │    Текст: "Following"                           │
  │                                                 │
  │  isFollowing === false:                         │
  │    Фон: #0095F6 (синий)                         │
  │    Текст: "Follow"                              │
  │                                                 │
  │  followLoading === true:                        │
  │    opacity: 0.6, cursor: not-allowed            │
  └─────────────────────────────────────────────────┘
```

**Счётчики подписчиков (Profile.jsx):**
- Отображаются как кликабельные ссылки
- `stats.followers` → ведёт на `/profile/:id/followers`
- `stats.following` → ведёт на `/profile/:id/following`

### 10.4 Frontend — Списки подписчиков и подписок

#### Followers.jsx — `/profile/:id/followers`

**Файл:** `frontend/src/pages/Followers.jsx`

```
Монтирование компонента
    │
    ▼
useEffect → request(`/users/${id}/followers?limit=50`)
    │
    ▼
setItems(data.items || [])
    │
    ▼
Рендер:
  ┌────────────────────────────────────┐
  │  ← Followers                       │  ← заголовок + кнопка "назад"
  ├────────────────────────────────────┤
  │  [avatar] Name / @username    →    │  ← каждый элемент — ссылка
  │  [avatar] Name / @username    →    │     на /profile/{user._id}
  │  [avatar] Name / @username    →    │
  ├────────────────────────────────────┤
  │  "No followers yet."               │  ← если список пуст
  └────────────────────────────────────┘
```

#### Following.jsx — `/profile/:id/following`

Идентичная структура, отличия:
- Запрос: `/users/${id}/following?limit=50`
- Заголовок: "Following"
- Пустой текст: "Not following anyone yet."

### 10.5 Полная схема подписки

```
Пользователь A          Frontend (Profile.jsx)         Backend                    MongoDB
    │                        │                            │                          │
    │ Открывает профиль B    │                            │                          │
    │ ─────────────────►     │                            │                          │
    │                        │ GET /api/users/:idB        │                          │
    │                        │ ──────────────────────►    │                          │
    │                        │                            │ User.findById(idB)       │
    │                        │                            │ Follow.countDocuments()  │
    │                        │                            │ Follow.findOne({A→B})    │
    │                        │                            │ ──────────────────────►  │
    │                        │                            │ ◄──────────────────────  │
    │                        │ ◄──────────────────────    │                          │
    │                        │ stats.isFollowing = false  │                          │
    │ Видит кнопку "Follow"  │ Кнопка синяя               │                          │
    │                        │                            │                          │
    │ Нажимает "Follow"      │                            │                          │
    │ ─────────────────►     │                            │                          │
    │                        │ POST /api/users/:idB/follow│                          │
    │                        │ ──────────────────────►    │                          │
    │                        │                            │ Follow.create({A, B})    │
    │                        │                            │ Notification.create()    │
    │                        │                            │ ──────────────────────►  │
    │                        │                            │ ◄──────────────────────  │
    │                        │ ◄──────────────────────    │ {following: true,        │
    │                        │ stats.isFollowing = true   │  followersCount: N}      │
    │ Видит "Following"      │ Кнопка серая               │                          │
    │ Счётчик обновлён       │ followers: N               │                          │
    │                        │                            │                          │
    │ Нажимает "Following"   │                            │                          │
    │ ─────────────────►     │                            │                          │
    │                        │ POST /api/users/:idB/follow│                          │
    │                        │ ──────────────────────►    │                          │
    │                        │                            │ Follow.deleteOne({A, B}) │
    │                        │                            │ ──────────────────────►  │
    │                        │                            │ ◄──────────────────────  │
    │                        │ ◄──────────────────────    │ {following: false,       │
    │                        │ stats.isFollowing = false  │  followersCount: N-1}    │
    │ Видит "Follow"         │ Кнопка синяя               │                          │
```

---

## 11. Уведомления — детальная реализация

### 11.1 Обзор системы уведомлений

Уведомления создаются автоматически при социальных действиях (лайк, комментарий, подписка) и отображаются пользователю. Каждое уведомление может быть помечено как прочитанное.

**Задействованные файлы:**

| Файл | Назначение |
|---|---|
| `backend/src/models/Notification.js` | Mongoose-схема уведомления |
| `backend/src/controllers/notificationsController.js` | Получение списка и пометка прочитанным |
| `backend/src/controllers/likesController.js` | Создание уведомления при лайке |
| `backend/src/controllers/commentsController.js` | Создание уведомления при комментарии |
| `backend/src/controllers/followController.js` | Создание уведомления при подписке |
| `backend/src/routes/notificationsRoutes.js` | Маршруты `/notifications` |
| `frontend/src/components/NotificationsList.jsx` | Компонент отображения уведомлений |
| `frontend/src/pages/Notifications.jsx` | Страница-обёртка для уведомлений |

### 11.2 Когда и как создаются уведомления

Уведомления создаются **внутри контроллеров действий**, а не в отдельном сервисе:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     СОЗДАНИЕ УВЕДОМЛЕНИЙ                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  likesController.js → toggleLike()                                  │
│  ─────────────────────────────────                                  │
│  Условие: liked === true И userId ≠ post.authorId                   │
│  Создаёт: Notification({                                           │
│    userId: post.authorId,    // получатель = автор поста            │
│    actorId: req.userId,      // инициатор = кто лайкнул            │
│    type: "like",                                                    │
│    entityId: post._id        // ссылка на пост                     │
│  })                                                                 │
│  Почему: автор должен узнать, что его пост оценили                  │
│  Почему не при unlike: отписка лайка — не событие для уведомления    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  commentsController.js → createComment()                            │
│  ────────────────────────────────────────                           │
│  Условие: userId ≠ post.authorId                                    │
│  Создаёт: Notification({                                           │
│    userId: post.authorId,    // получатель = автор поста            │
│    actorId: req.userId,      // инициатор = кто комментировал      │
│    type: "comment",                                                 │
│    entityId: comment._id     // ссылка на комментарий              │
│  })                                                                 │
│  Почему: автор должен узнать о новом комментарии к посту            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  followController.js → toggleFollow()                               │
│  ─────────────────────────────────────                              │
│  Условие: following === true (новая подписка)                       │
│  Создаёт: Notification({                                           │
│    userId: followingId,      // получатель = на кого подписались    │
│    actorId: followerId,      // инициатор = кто подписался          │
│    type: "follow",                                                  │
│    entityId: followerId      // ссылка на подписчика                │
│  })                                                                 │
│  Почему: пользователь должен знать о новом подписчике               │
│  Почему не при unfollow: отписка — не событие для уведомления        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Важно:** Уведомление НЕ создаётся, если пользователь лайкает/комментирует **свой собственный** пост — нет смысла уведомлять себя.

### 11.3 Backend — Контроллер уведомлений

**Файл:** `backend/src/controllers/notificationsController.js`

#### listNotifications() — GET `/api/notifications`

```
1. Фильтр: {userId: req.userId}  ← только уведомления текущего пользователя
2. Опциональный фильтр: ?unread=true → добавляется {read: false}
3. Лимит: 100 уведомлений
4. Сортировка: {createdAt: -1} (новые первыми)
5. Populate: actorId → {username, avatar, name}
6. Ответ: {items: [notifications]}
```

#### markNotificationRead() — PATCH `/api/notifications/:id/read`

```
1. Notification.findOneAndUpdate(
     {_id: id, userId: req.userId},   ← проверка владельца
     {read: true},
     {new: true}
   )
2. Если не найдено → 404
3. Ответ: {notification}
```

### 11.4 Frontend — Компонент NotificationsList

**Файл:** `frontend/src/components/NotificationsList.jsx`

#### Формирование текста уведомления

```javascript
function buildText(item) {
  const name = item.actorId?.username || "user";
  if (item.type === "like")    return `${name} liked your post`;
  if (item.type === "comment") return `${name} commented on your post`;
  if (item.type === "follow")  return `${name} started following you`;
  return `${name} did something`;
}
```

#### Формирование ссылки уведомления

```javascript
function buildLink(item) {
  if (item.type === "follow")                   return `/profile/${item.actorId?._id}`;
  if (item.type === "comment" || "like")        return `/post/${item.entityId}`;
  return `/`;
}
```

**Почему так:** При клике на уведомление о лайке/комментарии — переход к посту. При клике на уведомление о подписке — переход к профилю подписчика.

#### Загрузка и отображение

```
Монтирование NotificationsList
    │
    ▼
useEffect:
  request("/notifications")
    │
    ▼
  setItems(data.items)
    │
    ▼
Рендер каждого уведомления:
  ┌──────────────────────────────────────────────────────┐
  │  [avatar]  username liked your post    [Mark read]   │  ← непрочитанное
  │  [avatar]  username commented...                     │  ← прочитанное (opacity: 70%)
  │  [avatar]  username started following you            │
  └──────────────────────────────────────────────────────┘

Клик на "Mark read":
  │
  ▼
markRead(id):
  1. PATCH /api/notifications/:id/read
  2. Оптимистичное обновление:
     setItems(items.map(item =>
       item._id === id ? {...item, read: true} : item
     ))
  3. Кнопка исчезает, opacity снижается до 70%
```

**Оптимистичное обновление:** UI обновляется сразу, не дожидаясь ответа сервера — для мгновенного отклика.

### 11.5 Frontend — Страница Notifications

**Файл:** `frontend/src/pages/Notifications.jsx`

Простая страница-обёртка:
```
┌────────────────────────────────────────┐
│  ← Notifications                       │  ← заголовок + ссылка "назад" на /
├────────────────────────────────────────┤
│                                        │
│  <NotificationsList />                 │  ← рендерит компонент списка
│                                        │
└────────────────────────────────────────┘
```

### 11.6 Полная схема: от действия до уведомления на экране

```
Пользователь A                   Backend                        MongoDB
лайкает пост B
    │
    ▼
POST /api/posts/:id/like
    │
    ▼
likesController:
  Like.create({A, postId})
  post = Post.findById(postId)    ──────────────────────►  posts
  post.authorId = B                ◄──────────────────────
    │
    ▼
  A ≠ B → создать уведомление
  Notification.create({
    userId: B,                     ──────────────────────►  notifications
    actorId: A,
    type: "like",
    entityId: postId
  })
    │
    ▼
Ответ: {liked: true, likesCount: N}

═══════════════════════════════════════════════════════════

Позже, Пользователь B
открывает уведомления
    │
    ▼
GET /api/notifications
    │
    ▼
notificationsController:
  Notification.find({userId: B})    ──────────────────────►  notifications
    .populate("actorId")            ──────────────────────►  users
    .sort({createdAt: -1})          ◄──────────────────────
    │
    ▼
Ответ: {items: [{
  actorId: {username: "userA", avatar: "..."},
  type: "like",
  entityId: "postId123",
  read: false
}]}

═══════════════════════════════════════════════════════════

Frontend (NotificationsList.jsx):
    │
    ├── buildText() → "userA liked your post"
    ├── buildLink() → "/post/postId123"
    ├── read: false → показать кнопку "Mark read"
    └── Рендер: [avatar] userA liked your post [Mark read]

═══════════════════════════════════════════════════════════

Пользователь B нажимает "Mark read"
    │
    ▼
PATCH /api/notifications/:id/read
    │
    ▼
notificationsController:
  Notification.findOneAndUpdate(
    {_id: id, userId: B},          ──────────────────────►  notifications
    {read: true}                   ◄──────────────────────
  )
    │
    ▼
Frontend: оптимистичное обновление
  → кнопка исчезает
  → opacity: 70%
```

---

## 12. Поиск и Explore

### 12.1 Поиск пользователей

```
GET /api/search/users?q=john

Логика:
1. Параметр q обязателен и обрезается (trim)
2. Поиск по regex (case-insensitive) в полях username и name
3. Ограничение: 20 результатов (максимум 50)
4. Возвращает: {items: [{_id, username, name, avatar}]}
```

### 12.2 Explore (обзор)

```
GET /api/explore/posts?limit=30

Логика:
1. Используется MongoDB $sample для случайной выборки
2. К каждому посту подтягиваются данные автора через $lookup
3. Возвращает: {items: [random posts]}
```

---

## 13. Загрузка файлов

### 13.1 Конфигурация Multer

```javascript
// backend/src/middlewares/upload.js
multer({
  storage: multer.memoryStorage(),  // Хранение в RAM (buffer)
  limits: { fileSize: 5 * 1024 * 1024 }  // Максимум 5 МБ
})
```

### 13.2 Процесс обработки изображений

```
Frontend                              Backend                         MongoDB
    │                                    │                               │
    │ <input type="file"                 │                               │
    │   accept="image/*">               │                               │
    │                                    │                               │
    │ FormData:                          │                               │
    │   image: File(blob)               │                               │
    │   caption: "text"                 │                               │
    │                                    │                               │
    │ POST (multipart/form-data)        │                               │
    │ ─────────────────────────────►    │                               │
    │                                    │ multer → req.file.buffer      │
    │                                    │                               │
    │                                    │ Конвертация:                  │
    │                                    │ mime = req.file.mimetype      │
    │                                    │ b64 = buffer.toString("base64")│
    │                                    │ dataUrl = `data:${mime};base64,${b64}` │
    │                                    │                               │
    │                                    │ Сохранение dataUrl в поле    │
    │                                    │ Post.image или User.avatar   │
    │                                    │ ────────────────────────────► │
    │                                    │ ◄──────────────────────────── │
    │ ◄─────────────────────────────     │                              │
    │ {post/user с image: "data:..."}   │                               │
    │                                    │                               │
    │ <img src={post.image}>            │                               │
    │ Браузер декодирует base64         │                               │
```

**Важно:** Изображения хранятся непосредственно в MongoDB как base64-строки. Это упрощает архитектуру (нет файлового сервера), но увеличивает размер документов и нагрузку на БД.

---

## 14. Логирование и обработка ошибок

### 14.1 Backend — Логирование

**Уровень сервера (server.js):**
```
✔ Подключение к БД:    console.log("MongoDB connected")
✔ Запуск сервера:       console.log("Server running on port {PORT}")
```

**Уровень контроллеров:**
```
✔ Ошибки операций:      console.error("register:", err)
✔ Ссылка сброса пароля: console.log("Reset link:", url)  // только dev-режим
```

**Глобальный обработчик ошибок (app.js):**
```javascript
app.use((err, req, res, next) => {
  // Ошибка невалидного JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  // Все остальные ошибки
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
```

### 14.2 Backend — Обработка ошибок в контроллерах

Каждый контроллер оборачивает логику в `try/catch`:

| Код | Когда | Пример |
|---|---|---|
| 400 | Невалидные входные данные | Пустой email, короткий пароль |
| 401 | Не авторизован | Отсутствует/невалидный токен |
| 403 | Нет прав | Попытка редактировать чужой профиль |
| 404 | Не найдено | Пост/пользователь не существует |
| 409 | Конфликт | Email/username уже заняты |
| 500 | Внутренняя ошибка | Неожиданная ошибка БД |

### 14.3 Frontend — Обработка ошибок

**apiClient.js:**
```
1. Проверяет res.ok (статус 200-299)
2. Если ошибка → выбрасывает объект {status, details}
3. Компоненты ловят ошибки в catch и отображают через setState
```

**Компоненты:**
```
• useState для хранения ошибки
• Отображение ошибки в UI (красный текст, alert)
• mounted-флаг для предотвращения обновления состояния размонтированных компонентов
```

### 14.4 Что и почему логируется

```
Событие                          Где              Зачем
─────────────────────────────────────────────────────────────────
Подключение к MongoDB            server.js        Подтверждение старта
Запуск HTTP-сервера              server.js        Подтверждение порта
Ошибки регистрации               authController   Диагностика проблем
Ошибки логина                    authController   Диагностика проблем
Ссылка сброса пароля             authController   Dev: просмотр ссылки
Ошибки CRUD-операций             все контроллеры  Диагностика на проде
Невалидный JSON                  app.js           Защита от мусорных запросов
Необработанные исключения        app.js           Отлов непредвиденных ошибок
```

---

## 15. Схемы работы приложения

### 15.1 Полный цикл жизни пользователя

```
┌────────────────────────────────────────────────────────────────┐
│                    ЖИЗНЕННЫЙ ЦИКЛ ПОЛЬЗОВАТЕЛЯ                 │
└────────────────────────────────────────────────────────────────┘

Регистрация → Логин → Просмотр ленты → Создание поста
                          │                    │
                          ▼                    ▼
                    Лайк/Комментарий     Просмотр поста
                          │                    │
                          ▼                    ▼
                    Уведомление автору    Получение лайков
                                         и комментариев
                          │
                          ▼
                    Подписка на автора
                          │
                          ▼
                    Поиск пользователей
                          │
                          ▼
                    Редактирование профиля
                          │
                          ▼
                    Explore (случайные посты)
```

### 15.2 API-эндпоинты — Полная карта

```
/api
├── /auth
│   ├── POST /register              [Публичный]     Регистрация
│   ├── POST /login                 [Публичный]     Вход
│   ├── GET  /me                    [Защищённый]    Текущий пользователь
│   ├── POST /forgot-password       [Публичный]     Запрос сброса пароля
│   └── POST /reset-password        [Публичный]     Установка нового пароля
│
├── /users
│   ├── GET    /:id                 [Опц. авторизация]  Профиль
│   ├── PATCH  /:id                 [Защищённый]        Обновление профиля
│   ├── PATCH  /:id/avatar          [Защищённый]        Обновление аватара
│   ├── GET    /:id/posts           [Опц. авторизация]  Посты пользователя
│   ├── POST   /:id/follow          [Защищённый]        Подписка/Отписка
│   ├── GET    /:id/followers       [Публичный]         Список подписчиков
│   └── GET    /:id/following       [Публичный]         Список подписок
│
├── /posts
│   ├── GET    /                    [Опц. авторизация]  Лента (пагинация)
│   ├── POST   /                    [Защищённый]        Создание поста
│   ├── GET    /:id                 [Опц. авторизация]  Один пост
│   ├── PATCH  /:id                 [Защищённый]        Редактирование
│   ├── DELETE /:id                 [Защищённый]        Удаление
│   ├── POST   /:id/like           [Защищённый]        Лайк/Анлайк
│   ├── GET    /:id/comments       [Публичный]         Комментарии
│   └── POST   /:id/comments       [Защищённый]        Новый комментарий
│
├── /search
│   └── GET /users?q=...           [Публичный]         Поиск пользователей
│
├── /explore
│   └── GET /posts                 [Публичный]         Случайные посты
│
├── /notifications
│   ├── GET    /                   [Защищённый]        Список уведомлений
│   └── PATCH  /:id/read          [Защищённый]        Пометить прочитанным
│
└── /health                        [Публичный]         Проверка работоспособности
```

### 15.3 Пагинация

```
Запрос:  GET /api/posts?page=2&limit=10

Логика:
  page = Math.max(1, parseInt(page))
  limit = Math.min(50, Math.max(1, parseInt(limit)))
  skip = (page - 1) * limit

Ответ:
{
  items: [...],        // массив элементов
  page: 2,             // текущая страница
  limit: 10,           // элементов на странице
  total: 47            // всего элементов
}

Вычисление на фронте:
  totalPages = Math.ceil(total / limit)  // 47/10 = 5 страниц
  hasMore = page < totalPages
```

### 15.4 Безопасность — Резюме

```
┌────────────────────────────────────────────────────────┐
│                     БЕЗОПАСНОСТЬ                       │
├──────────────────────┬─────────────────────────────────┤
│ Пароли               │ bcrypt (10 salt rounds)         │
│ Аутентификация       │ JWT (HS256, 7 дней)             │
│ Токен сброса         │ SHA256 + истечение 15 мин       │
│ Владелец ресурса     │ Проверка req.userId === authorId│
│ Дубликаты            │ Unique-индексы (email, like)    │
│ Размер файлов        │ 5 МБ лимит (multer)            │
│ Длина полей          │ Ограничения в схемах Mongoose   │
│ CORS                 │ Разрешён только frontend origin │
│ Пароль в ответах     │ select: false (не выдаётся)     │
│ Forgot password      │ Одинаковый ответ (не раскрывает │
│                      │ наличие пользователя)           │
└──────────────────────┴─────────────────────────────────┘
```

---

## 16. Заключение и рекомендации

### 16.1 Общая оценка проекта

ICHgram — функционально завершённое полнофункциональное приложение, покрывающее основной набор возможностей социальной сети: регистрация, публикация контента, лайки, комментарии, подписки, уведомления, поиск и explore. Код структурирован по паттерну MVC, разделение frontend/backend чёткое, API спроектирован логично и единообразно.

**Сильные стороны:**
- Чёткое разделение ответственности: routes → middleware → controllers → models
- Единообразный REST API с пагинацией и корректными HTTP-статусами
- Toggle-механизм для лайков и подписок — одна функция вместо двух эндпоинтов
- Уникальные составные индексы защищают от дублирования данных на уровне БД
- Безопасность паролей: bcrypt, select: false, хешированные токены сброса
- Frontend построен на стандартных инструментах (React, React Router, Tailwind) без лишних абстракций

**Области для улучшения:**
- Изображения хранятся как base64 в MongoDB — неоптимально для production
- Клиент-валидация форм минимальна — ошибки только после отправки на сервер
- Нет rate limiting — API открыт для брутфорса
- Нет unit/integration тестов
- Логирование только через console — нет структурированных логов

### 16.2 Рекомендации в пределах текущего стека

Все рекомендации используют **только текущий стек** (React, Express, MongoDB, Tailwind) и совместимые библиотеки.

#### Backend (Express + Mongoose)

**1. Хранение изображений — вынести из MongoDB**

Текущее решение: base64 строка в документе (Post.image, User.avatar).
Проблема: увеличивает размер документов, нагрузку на БД и трафик.

Рекомендация: сохранять файлы на диск через multer `diskStorage` и отдавать через `express.static`:

```
// multer → сохраняет в /uploads/
// Post.image → "/uploads/posts/filename.jpg" (путь, не base64)
// express.static("/uploads", uploadDir) → отдаёт файлы напрямую
```

Это решение не требует внешних сервисов — только файловая система сервера.

**2. Rate Limiting — express-rate-limit**

```bash
npm install express-rate-limit
```

Критичные эндпоинты для ограничения:
- `/api/auth/login` — защита от брутфорса (5-10 попыток в минуту)
- `/api/auth/register` — защита от массовой регистрации
- `/api/auth/forgot-password` — защита от спама сброса

```javascript
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 минут
  max: 10,                    // 10 попыток
  message: { error: "Too many attempts, try again later" }
});

app.use("/api/auth/login", authLimiter);
```

**3. Валидация входных данных — express-validator**

```bash
npm install express-validator
```

Сейчас валидация разбросана по контроллерам (`if (!email) return res.status(400)...`). express-validator позволяет вынести правила в middleware на уровне роутов:

```javascript
import { body, validationResult } from "express-validator";

router.post("/register",
  body("email").isEmail().withMessage("Неверный email"),
  body("username").isLength({ min: 3, max: 30 }),
  body("password").isLength({ min: 8 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  authController.register
);
```

**4. Helmet — HTTP-заголовки безопасности**

```bash
npm install helmet
```

```javascript
import helmet from "helmet";
app.use(helmet());
```

Добавляет заголовки: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` и другие. Одна строка кода — заметное усиление безопасности.

**5. Логирование — morgan**

```bash
npm install morgan
```

```javascript
import morgan from "morgan";
app.use(morgan("dev"));   // → POST /api/auth/login 200 12ms
```

Заменяет ручные `console.log` в контроллерах структурированными логами HTTP-запросов. Формат `dev` для разработки, `combined` для production.

**6. Централизованная обработка ошибок**

Сейчас каждый контроллер дублирует `try/catch` с одинаковой обработкой. Рекомендуется обёртка:

```javascript
// utils/asyncHandler.js
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Использование в роутах:
router.post("/", auth, asyncHandler(postsController.create));
```

Ошибки автоматически попадают в глобальный error handler — дублирование try/catch исчезает.

#### Frontend (React + Tailwind)

**1. React Hook Form — клиент-валидация**

```bash
npm install react-hook-form
```

Подробно описано в разделе 3.5. Приоритетные формы для миграции: Register (4 поля, сложные правила), ResetPassword (совпадение паролей), ProfileEdit (валидация email/username).

**2. Оптимистичные обновления — расширить на все действия**

Сейчас оптимистичное обновление применяется только в NotificationsList (markRead). Рекомендуется расширить на:
- **Лайки:** обновлять счётчик и иконку до ответа сервера, откатывать при ошибке
- **Подписки:** обновлять текст кнопки и счётчик до ответа сервера

```javascript
// Пример оптимистичного лайка:
setLiked(!liked);
setLikesCount(prev => liked ? prev - 1 : prev + 1);
try {
  const data = await request(`/posts/${id}/like`, { method: "POST" });
  setLiked(data.liked);
  setLikesCount(data.likesCount);
} catch {
  // Откат при ошибке
  setLiked(liked);
  setLikesCount(prev => liked ? prev + 1 : prev - 1);
}
```

**3. Debounce для поиска**

Если поиск вызывается при каждом нажатии клавиши — добавить debounce через `setTimeout`:

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    if (query.trim()) fetchResults(query);
  }, 300);
  return () => clearTimeout(timer);
}, [query]);
```

Не требует дополнительных библиотек — нативный `setTimeout` + cleanup в useEffect.

**4. Lazy Loading страниц — React.lazy**

```javascript
// App.jsx
const Feed = React.lazy(() => import("./pages/Feed"));
const Explore = React.lazy(() => import("./pages/Explore"));
const Profile = React.lazy(() => import("./pages/Profile"));

// В роутах:
<Suspense fallback={<div>Loading...</div>}>
  <Route path="/" element={<Feed />} />
</Suspense>
```

Разбивает бандл на чанки — начальная загрузка быстрее. Встроено в React, не требует дополнительных зависимостей.

**5. useCallback/useMemo для тяжёлых компонентов**

В `FeedPost.jsx` и `PostDetail.jsx` обработчики лайков и комментариев пересоздаются при каждом рендере. Обернуть в `useCallback`:

```javascript
const handleLike = useCallback(async () => {
  // логика лайка
}, [postId]);
```

Актуально при длинных списках постов — уменьшает количество ре-рендеров дочерних компонентов.

#### База данных (MongoDB + Mongoose)

**1. Индекс для ленты по подписчикам**

Сейчас лента показывает все посты. Для ленты "только от подписок" потребуется:

```javascript
// Получить ID подписок текущего пользователя
const following = await Follow.find({ followerId: userId }).select("followingId");
const ids = following.map(f => f.followingId);

// Посты только от подписок
Post.find({ authorId: { $in: ids } }).sort({ createdAt: -1 });
```

Индекс `{ authorId: 1, createdAt: -1 }` уже покроет этот запрос.

**2. TTL-индекс для уведомлений**

Уведомления накапливаются бесконечно. Можно добавить автоматическое удаление старых:

```javascript
// В модели Notification.js
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 }); // 90 дней
```

MongoDB автоматически удалит документы старше 90 дней.

**3. Каскадное удаление**

При удалении поста лайки и комментарии к нему остаются в БД. Добавить очистку в контроллер:

```javascript
// postsController.js → deletePost()
await Promise.all([
  Like.deleteMany({ postId: post._id }),
  Comment.deleteMany({ postId: post._id }),
  Notification.deleteMany({ entityId: post._id }),
]);
await post.deleteOne();
```

Или через Mongoose middleware `post("findOneAndDelete")` в модели Post.

### 16.3 Приоритеты реализации

```
Приоритет   Рекомендация                   Сложность   Влияние
─────────────────────────────────────────────────────────────────
Высокий     Rate limiting (express-rate-    Низкая      Безопасность
            limit)
Высокий     Helmet (заголовки              Низкая      Безопасность
            безопасности)
Высокий     Каскадное удаление             Низкая      Целостность данных
            (посты → лайки/комментарии)
Средний     Хранение изображений на         Средняя     Производительность,
            диске вместо base64                         размер БД
Средний     React Hook Form                Средняя     UX (валидация форм)
Средний     asyncHandler (убрать            Низкая      Чистота кода
            дублирование try/catch)
Средний     morgan (логирование запросов)   Низкая      Отладка
Средний     express-validator              Средняя     Надёжность валидации
Низкий      Lazy Loading страниц           Низкая      Скорость загрузки
Низкий      Оптимистичные обновления       Средняя     UX (отзывчивость)
Низкий      TTL-индекс для уведомлений     Низкая      Размер БД
Низкий      useCallback/useMemo            Низкая      Производительность
```

### 16.4 Итог

Проект ICHgram представляет собой работающую социальную сеть с полным набором базовых функций. Кодовая база чистая, архитектура логичная, стек современный и широко используемый. Основные направления развития — усиление безопасности (rate limiting, helmet), улучшение UX (клиент-валидация через React Hook Form, оптимистичные обновления) и оптимизация хранения данных (изображения на диске, каскадное удаление, TTL-индексы). Все рекомендации реализуемы в рамках текущего стека без смены архитектуры.
