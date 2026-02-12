# Управление пользователями: профиль, аватар, подписки

[< Назад к содержанию](README.md) | [Далее: Маршрутизация >](06-routing.md)

---

## Просмотр профиля (GET /api/users/:id)

### Поток данных

```
GET /api/users/:id
      │
      ▼
  optionalAuth middleware
  (userId может быть или нет)
      │
      ▼
  getProfile():
      │
      ▼
  1. User.findById(id).select("-password")
     Не найден → 404
      │
      ▼
  2. Проверка: это владелец профиля?
     ownerCheck = String(req.userId) === String(user._id)
      │
      ├── Владелец: полный профиль (включая email)
      └── Гость:    email УДАЛЯЕТСЯ из ответа
      │
      ▼
  3. Параллельные запросы (Promise.all):
     ┌─────────────────────────────────────────────────┐
     │ Post.countDocuments({ authorId: id })    → posts │
     │ Follow.countDocuments({ followingId: id })→ followers│
     │ Follow.countDocuments({ followerId: id }) → following│
     └─────────────────────────────────────────────────┘
      │
      ▼
  4. Если гость авторизован:
     Follow.exists({ followerId: req.userId, followingId: id })
     → isFollowing: true|false
      │
      ▼
  Ответ:
  {
    user: { _id, username, name, bio, website, avatar, createdAt },
    stats: {
      posts: 12,
      followers: 156,
      following: 89,
      isFollowing: true
    }
  }
```

### Скрытие email от других пользователей

```
Владелец профиля:                  Другой пользователь:
{                                  {
  user: {                            user: {
    _id: "...",                        _id: "...",
    email: "user@mail.com",  ✓        username: "johndoe",
    username: "johndoe",               name: "John",
    name: "John",                      bio: "...",
    bio: "...",                        avatar: "data:..."
    avatar: "data:..."                 // email УДАЛЁН
  }                                  }
}                                  }
```

---

## Редактирование профиля (PATCH /api/users/:id)

### Полный поток

```
Клиент (ProfileEdit.jsx)              Сервер (usersController.updateProfile)
        │                                           │
   1.   │ Форма с полями:                           │
        │ name, bio, website,                       │
        │ username, email                            │
        │                                           │
   2.   │ PATCH /api/users/:id                      │
        │ Body: { name, bio, website }              │
        ├──────────────────────────────────────────►│
        │                                           │
        │                                      3.   │ auth middleware → req.userId
        │                                           │
        │                                      4.   │ Проверка владельца:
        │                                           │ req.userId === req.params.id?
        │                                           │ Нет → 403 "Forbidden"
        │                                           │
        │                                      5.   │ Фильтрация полей:
        │                                           │ allowedFields = [
        │                                           │   "name", "bio", "username",
        │                                           │   "email", "website"
        │                                           │ ]
        │                                           │ Только разрешённые поля
        │                                           │ попадают в updates
        │                                           │
        │                                      6.   │ User.findById(id).select("+password")
        │                                           │ Не найден → 404
        │                                           │
        │                                      7.   │ user.set(updates)
        │                                           │ user.save()
        │                                           │    │
        │                                           │    ▼ Mongoose валидация:
        │                                           │    • email формат
        │                                           │    • username: 3-30 символов
        │                                           │    • bio: max 160
        │                                           │    • website: max 200
        │                                           │    │
        │                                           │    ▼ Unique index:
        │                                           │    Если email/username занят
        │                                           │    → E11000 → 409
        │                                           │
        │  200 { user: {...} }                      │
        │◄──────────────────────────────────────────┤
        │                                           │
   8.   │ updateUser(data.user) ← AuthContext
        │ → UI обновляется
```

### Зачем select("+password") при обновлении

```
User.findById(id).select("+password")

Почему: поле password имеет select: false.
Если получить документ без password и вызвать .save(),
Mongoose увидит, что password = undefined,
и pre('save') hook НЕ изменит пароль
(isModified("password") = false).

Без +password документ корректно сохранится,
но password останется в MongoDB нетронутым.
Чтобы .save() не обнулил поле, нужно его загрузить.
```

### Whitelist-подход к обновлению

```
❌ Опасно — прямая передача body:
   User.findByIdAndUpdate(id, req.body)
   → Атакующий может отправить:
     { "password": "hacked", "email": "evil@..." }

✓ Безопасно — только разрешённые поля:
   const allowedFields = ["name", "bio", "username", "email", "website"];
   const updates = {};
   for (const field of allowedFields) {
     if (req.body[field] !== undefined) {
       updates[field] = req.body[field];
     }
   }
   user.set(updates);
```

---

## Обновление аватара (PATCH /api/users/:id/avatar)

```
Клиент                                 Сервер
        │                                           │
   1.   │ <input type="file">                       │
        │ → File object                             │
        │                                           │
   2.   │ const formData = new FormData()           │
        │ formData.append("image", file)            │
        │                                           │
   3.   │ PATCH /api/users/:id/avatar               │
        │ Content-Type: multipart/form-data         │
        │ (автоматически от браузера)               │
        ├──────────────────────────────────────────►│
        │                                           │
        │                                      4.   │ auth middleware → req.userId
        │                                           │
        │                                      5.   │ upload.single("image")
        │                                           │ Multer → req.file
        │                                           │
        │                                      6.   │ Проверка владельца:
        │                                           │ req.userId === req.params.id?
        │                                           │ Нет → 403
        │                                           │
        │                                      7.   │ req.file есть?
        │                                           │ Нет → 400
        │                                           │
        │                                      8.   │ toDataUrl(req.file):
        │                                           │ mimeType = req.file.mimetype
        │                                           │ base64 = buffer.toString("base64")
        │                                           │ → "data:image/jpeg;base64,/9j/..."
        │                                           │
        │                                      9.   │ user.avatar = dataUrl
        │                                           │ user.save()
        │                                           │
        │  200 { user: { avatar: "data:..." } }     │
        │◄──────────────────────────────────────────┤
        │                                           │
  10.   │ updateUser(data.user)
        │ → Аватар обновляется на всех страницах
```

### Цепочка middleware для аватара

```
PATCH /api/users/:id/avatar
      │
      ▼
  auth                    → JWT проверка
      │
      ▼
  upload.single("image")  → Multer парсит файл (max 5MB)
      │
      ▼
  updateAvatar            → Конвертация в Base64, сохранение
```

---

## Подписки (Follow/Unfollow)

### Toggle Follow (POST /api/users/:id/follow)

```
POST /api/users/:id/follow
        │
        ▼
   1. Подписка на себя?
      targetId === userId → 400 "Cannot follow yourself"

   2. User.findById(targetId)
      Не найден → 404

   3. Follow.findOne({ followerId: userId, followingId: targetId })
        │
   ┌────┴────┐
   Найден    Не найден
   │         │
   ▼         ▼
  УДАЛИТЬ   СОЗДАТЬ
  (unfollow) Follow.create({
  existing     followerId: userId,
  .deleteOne() followingId: targetId
  following=   })
  false        following=true
   │         │
   └────┬────┘
        │
        ▼
   4. Уведомление (только при подписке):
      Notification.create({
        userId: targetId,      ← получатель (на кого подписались)
        actorId: userId,       ← инициатор (кто подписался)
        type: "follow",
        entityId: targetId
      })

   5. Параллельный подсчёт:
      followersCount = Follow.countDocuments({ followingId: targetId })
      followingCount = Follow.countDocuments({ followerId: targetId })

   6. Ответ:
      { following: true, followersCount: 157, followingCount: 89 }
```

### Список подписчиков (GET /api/users/:id/followers)

```
GET /api/users/:id/followers?page=1&limit=20
        │
        ▼
   Follow.find({ followingId: userId })
   .sort({ createdAt: -1 })
   .skip(0).limit(20)
   .populate("followerId", "username avatar name")
        │
        ▼
   Маппинг: items.map(item => item.followerId)
   → Возвращает массив пользователей, а не Follow-документов

   Ответ:
   {
     items: [
       { _id, username: "alice", avatar: "data:...", name: "Alice" },
       { _id, username: "bob", avatar: "data:...", name: "Bob" },
       ...
     ],
     page: 1, limit: 20, total: 156
   }
```

### Список подписок (GET /api/users/:id/following)

```
Аналогично followers, но:
Follow.find({ followerId: userId })
.populate("followingId", "username avatar name")
→ items.map(item => item.followingId)
```

---

## Уведомления

### Когда создаются уведомления

```
┌──────────────┬──────────────────────┬───────────────────────────┐
│ Действие     │ Тип уведомления      │ Получатель                │
├──────────────┼──────────────────────┼───────────────────────────┤
│ Лайк поста   │ "like"               │ Автор поста               │
│ Комментарий  │ "comment"            │ Автор поста               │
│ Подписка     │ "follow"             │ Пользователь, на которого │
│              │                      │ подписались               │
│ Лайк коммент.│ "like_comment"       │ Автор комментария         │
└──────────────┴──────────────────────┴───────────────────────────┘

Уведомление НЕ создаётся, если действие над своим контентом
(authorId === userId).
```

### Получение уведомлений (GET /api/notifications)

```
GET /api/notifications
        │
        ▼
   1. Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("actorId", "username avatar name")
        │
        ▼
   2. Для comment/like_comment:
      Подгрузить postId из Comment документа.
      (entityId → Comment._id → Comment.postId)
        │
        ▼
   3. Для like:
      postId = entityId (entityId и есть postId)
        │
        ▼
   Ответ:
   {
     items: [
       {
         type: "like",
         actorId: { username: "alice", avatar: "..." },
         postId: "...",
         read: false,
         createdAt: "2024-01-15T..."
       },
       {
         type: "comment",
         actorId: { username: "bob", avatar: "..." },
         postId: "...",        ← подгружен из Comment
         commentId: "...",     ← entityId
         read: true,
         createdAt: "..."
       },
       ...
     ]
   }
```

### Счётчик непрочитанных (GET /api/notifications/unread-count)

```
Notification.countDocuments({ userId, read: false }) → count

Ответ: { count: 5 }

Используется в Sidebar для отображения badge с числом.
```

### Пометка прочитанным (PATCH /api/notifications/:id/read)

```
1. Notification.findOne({ _id: id, userId })
   (проверяет, что уведомление принадлежит текущему пользователю)
   Не найдено → 404

2. notification.read = true
   notification.save()

3. Ответ: { notification: {...} }
```

### Удаление (DELETE /api/notifications/:id)

```
1. Валидация: ObjectId.isValid(id)?
   Нет → 400

2. Notification.findOneAndDelete({ _id: id, userId })
   Не найдено → 404

3. Ответ: { success: true, deletedId: "..." }
```
