# Посты, лайки и комментарии

[< Назад к содержанию](README.md) | [Далее: Управление пользователями >](05-user-management.md)

---

## Создание поста

### Полный поток: от клика «Опубликовать» до записи в MongoDB

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌───────────┐
│  PostCreateContent│    │    apiClient.js   │    │  postsController │    │  MongoDB  │
│  (frontend)      │    │                  │    │  (backend)       │    │           │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘    └─────┬─────┘
         │                       │                       │                    │
    1.   │ Пользователь          │                       │                    │
         │ выбирает файл         │                       │                    │
         │ и пишет подпись       │                       │                    │
         │                       │                       │                    │
    2.   │ Формирует FormData:   │                       │                    │
         │ image: File           │                       │                    │
         │ caption: "text"       │                       │                    │
         │                       │                       │                    │
    3.   │──POST /api/posts─────►│                       │                    │
         │  Content-Type:        │                       │                    │
         │  multipart/form-data  │                       │                    │
         │  (браузер ставит сам) │                       │                    │
         │                       │                       │                    │
         │                  4.   │──Authorization:───────►│                    │
         │                       │  Bearer <token>       │                    │
         │                       │                       │                    │
         │                       │                  5.   │ auth middleware:    │
         │                       │                       │ jwt.verify()       │
         │                       │                       │ req.userId = "..." │
         │                       │                       │                    │
         │                       │                  6.   │ upload middleware   │
         │                       │                       │ (Multer):          │
         │                       │                       │ Парсит multipart   │
         │                       │                       │ req.file = {       │
         │                       │                       │   buffer: <Buffer>,│
         │                       │                       │   mimetype: "image │
         │                       │                       │   /jpeg",          │
         │                       │                       │   size: 245760     │
         │                       │                       │ }                  │
         │                       │                       │                    │
         │                       │                  7.   │ createPost():      │
         │                       │                       │                    │
         │                       │                       │ req.file есть?     │
         │                       │                       │ Нет → 400          │
         │                       │                       │                    │
         │                       │                  8.   │ toDataUrl(req.file)│
         │                       │                       │ mimeType = "image/ │
         │                       │                       │   jpeg"            │
         │                       │                       │ base64 = buffer    │
         │                       │                       │   .toString(       │
         │                       │                       │   "base64")        │
         │                       │                       │ dataUrl =          │
         │                       │                       │   "data:image/jpeg │
         │                       │                       │   ;base64,/9j/..." │
         │                       │                       │                    │
         │                       │                  9.   │ Post.create({      │
         │                       │                       │   authorId:        │
         │                       │                       │     req.userId,    │
         │                       │                       │   image: dataUrl,  │
         │                       │                       │   caption: "text"  │
         │                       │                       │ })─────────────────►│
         │                       │                       │                    │
         │                       │                       │              10.   │ Сохранение
         │                       │                       │                    │ документа
         │                       │                       │                    │ в коллекцию
         │                       │                       │                    │ posts
         │                       │                       │                    │
         │                       │  201 { post: {...} }  │◄───────────────────│
         │  201 { post: {...} }  │◄──────────────────────│                    │
         │◄──────────────────────│                       │                    │
         │                       │                       │                    │
   11.   │ Диспатч custom event  │                       │                    │
         │ "post:created"        │                       │                    │
         │ → лента обновится     │                       │                    │
```

### Цепочка middleware для POST /posts

```
POST /api/posts
      │
      ▼
  auth middleware         → Проверяет JWT, устанавливает req.userId
      │
      ▼
  upload.single("image")  → Multer парсит multipart, устанавливает req.file
      │
      ▼
  createPost controller   → Бизнес-логика: конвертация в Base64, сохранение
```

---

## Лента постов (Feed)

### Home Feed: посты от подписок

```
GET /api/feed/home?page=1&limit=20

┌──────────────────────────────────────────────────────────────────────┐
│                      listHomeFeed()                                  │
│                                                                      │
│  1. parsePagination(req.query) → { page: 1, limit: 20, skip: 0 }   │
│                                                                      │
│  2. getFollowingIds(req.userId)                                     │
│     Follow.find({ followerId: userId }).select("followingId")       │
│     → [ObjectId("aaa"), ObjectId("bbb"), ObjectId("ccc")]           │
│                                                                      │
│  3. Если followingIds пуст → вернуть { items: [], total: 0 }       │
│                                                                      │
│  4. Post.aggregate([                                                │
│       { $match: {                                                    │
│           authorId: { $in: followingIds },  ← посты от подписок     │
│           authorId: { $ne: currentUserId }  ← исключить свои        │
│       }},                                                            │
│       { $sort: { createdAt: -1 } },         ← от новых к старым    │
│       { $skip: 0 },                                                  │
│       { $limit: 20 },                                                │
│       { $lookup: {                           ← JOIN с users         │
│           from: "users",                                             │
│           localField: "authorId",                                    │
│           foreignField: "_id",                                       │
│           as: "authorId"                                             │
│       }},                                                            │
│       { $unwind: "$authorId" },              ← массив → объект      │
│       { $lookup: { from: "likes", ... } },   ← JOIN с likes        │
│       { $lookup: { from: "comments", ... } },← JOIN с comments     │
│       { $addFields: {                                                │
│           likesCount: { $size: "$likes" },                           │
│           commentsCount: { $size: "$comments" }                      │
│       }},                                                            │
│       { $project: {                                                  │
│           likes: 0,                          ← убрать массивы      │
│           comments: 0,                                               │
│           "authorId.password": 0             ← убрать пароль        │
│       }}                                                             │
│     ])                                                               │
│                                                                      │
│  5. Параллельно: Post.countDocuments(match) → total                 │
│                                                                      │
│  Ответ: { items: [...], page: 1, limit: 20, total: 45 }            │
└──────────────────────────────────────────────────────────────────────┘
```

### Explore Feed: посты от незнакомых

```
GET /api/feed/explore?page=1&limit=20

Отличие от Home Feed:
• Home: authorId IN followingIds (посты от подписок)
• Explore: authorId NOT IN [...followingIds, currentUserId]
  (посты от пользователей, на которых НЕ подписан, и НЕ свои)
```

---

## Детальный просмотр поста (GET /api/posts/:id)

```
GET /api/posts/:id
      │
      ▼
  optionalAuth middleware  → userId может быть, а может нет
      │
      ▼
  getPost():
      │
      ├── Post.findById(id).populate("authorId", "username avatar")
      │
      ├── Параллельно:
      │   ├── Like.countDocuments({ postId }) → likesCount
      │   └── Like.exists({ userId, postId }) → liked (boolean)
      │       (только если userId есть, иначе false)
      │
      ▼
  Ответ:
  {
    post: { _id, authorId: { username, avatar }, image, caption, ... },
    stats: { likes: 42, liked: true }
  }
```

---

## Toggle Like (POST /api/posts/:id/like)

### Алгоритм toggle (один эндпоинт для лайка и анлайка)

```
POST /api/posts/:id/like
        │
        ▼
   1. Найти пост:
      Post.findById(postId).select("_id authorId")
      Не найден → 404
        │
        ▼
   2. Поиск существующего лайка:
      Like.findOne({ userId, postId })
        │
   ┌────┴────┐
   Найден    Не найден
   │         │
   ▼         ▼
  УДАЛИТЬ   СОЗДАТЬ
  existing   Like.create({
  .deleteOne()  userId,
  liked=false   postId
                })
                liked=true
   │         │
   └────┬────┘
        │
        ▼
   3. Создать уведомление (только при лайке):
      if (liked && authorId !== userId) {
        Notification.create({
          userId: authorId,     ← получатель (автор поста)
          actorId: userId,      ← инициатор (кто лайкнул)
          type: "like",
          entityId: postId
        })
      }
        │
        ▼
   4. Подсчёт:
      Like.countDocuments({ postId }) → likesCount
        │
        ▼
   Ответ: { liked: true|false, likesCount: 42 }
```

### Почему toggle, а не отдельные like/unlike

```
Один эндпоинт:                      Два эндпоинта:
POST /posts/:id/like                 POST /posts/:id/like
                                     DELETE /posts/:id/like
│                                    │
▼                                    ▼
Проще на frontend:                   Frontend должен знать
один запрос, один обработчик.        текущее состояние,
Сервер сам определяет,               выбирать метод,
лайкнуть или анлайкнуть.             два обработчика.

В проекте выбран toggle — один эндпоинт для простоты.
```

### Защита от дублей

```
Like модель имеет уникальный составной индекс:
{ userId: 1, postId: 1 } (unique)

Даже если два запроса придут одновременно:
• Первый: Like.create({ userId, postId }) → ОК
• Второй: Like.create({ userId, postId }) → E11000 duplicate key

Но в toggleLike сначала проверяется Like.findOne(),
поэтому дубль невозможен при нормальной работе.
Индекс — это страховка на уровне БД.
```

---

## Комментарии

### Создание комментария (POST /api/posts/:id/comments)

```
POST /api/posts/:id/comments
Body: { text: "Nice photo!" }
        │
        ▼
   1. Валидация: text пустой → 400

   2. Пост существует?
      Post.findById(postId) → Нет → 404

   3. Comment.create({ postId, userId, text })
      .populate("userId", "username avatar name")

   4. Уведомление (если комментирует не свой пост):
      Notification.create({
        userId: post.authorId,
        actorId: userId,
        type: "comment",
        entityId: comment._id   ← ID комментария
      })

   5. Ответ:
      {
        comment: {
          _id, userId: { username, avatar }, text,
          likesCount: 0, likedByMe: false
        }
      }
```

### Список комментариев (GET /api/posts/:id/comments)

```
GET /api/posts/:id/comments?page=1&limit=20
        │
        ▼
   1. Comment.find({ postId })
      .sort({ createdAt: -1 })
      .skip(0).limit(20)
      .populate("userId", "username avatar name")

   2. Для каждого комментария:
      likes = comment.likes[]  (массив userId)
      likesCount = likes.length
      likedByMe = likes.includes(req.userId)

   3. Ответ:
      {
        items: [
          { _id, text, userId: {...}, likesCount: 3, likedByMe: true },
          ...
        ],
        page: 1, limit: 20, total: 8
      }
```

### Toggle Like комментария (POST /api/comments/:commentId/like)

```
POST /api/comments/:commentId/like
        │
        ▼
   1. Comment.findById(commentId)
      Не найден → 404

   2. Проверить: userId уже в comment.likes[]?
        │
   ┌────┴────┐
   Да        Нет
   │         │
   ▼         ▼
  УБРАТЬ    ДОБАВИТЬ
  .filter() .push(userId)
  из массива
   │         │
   └────┬────┘
        │
        ▼
   3. comment.save()

   4. Уведомление:
      • Лайк чужого комментария → создать Notification (type: "like_comment")
      • Анлайк → удалить Notification

   5. Ответ:
      { comment: { ..., likesCount: 5, likedByMe: true|false } }
```

---

## Редактирование поста (PATCH /api/posts/:id)

```
PATCH /api/posts/:id
Body: { caption: "Updated caption" }
        │
        ▼
   1. Post.findById(id)
      Не найден → 404

   2. Проверка владельца:
      post.authorId === req.userId?
      Нет → 403 "Forbidden"

   3. post.caption = req.body.caption
      post.save()

   4. Ответ: { post: { _id, authorId, image, caption } }
```

Изменять можно только `caption`. Изображение не заменяется.

---

## Удаление поста (DELETE /api/posts/:id)

```
DELETE /api/posts/:id
        │
        ▼
   1. Post.findById(id)
      Не найден → 404

   2. Проверка владельца:
      post.authorId === req.userId?
      Нет → 403 "Forbidden"

   3. post.deleteOne()

   4. Ответ: 204 No Content (пустое тело)
```

**Примечание:** связанные Like и Comment для этого поста НЕ удаляются автоматически (нет cascade delete). Они остаются «осиротевшими» в БД. Для учебного проекта это допустимо.

---

## Пагинация

### Утилита parsePagination()

```javascript
parsePagination(req.query, defaultLimit = 20)

Вход: { page: "2", limit: "15" }
Выход: { page: 2, limit: 15, skip: 15 }

Правила:
• page: минимум 1
• limit: минимум 1, максимум 50
• skip: (page - 1) * limit

Формула:
  page=1, limit=20 → skip=0   (записи 1-20)
  page=2, limit=20 → skip=20  (записи 21-40)
  page=3, limit=20 → skip=40  (записи 41-60)
```

### Формат ответа с пагинацией

```json
{
  "items": [...],
  "page": 2,
  "limit": 20,
  "total": 85
}
```

Frontend может вычислить: `hasMore = page * limit < total`
