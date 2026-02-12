# Модели данных (Mongoose)

Навигация: [README.md](README.md) → [05-api-spec.md](05-api-spec.md)

Ниже описания полей, типов, индексов и связей. Пароль никогда не возвращается в ответах (использовать `.select('-password')`).

## User
Назначение: учетная запись пользователя.

Поля:
- `_id`: ObjectId
- `email`: String, unique, required, lowercase, match (email regex)
- `username`: String, unique, required, minlength 3, maxlength 30
- `password`: String, required, minlength 8, select: false (хранится в хеше)
- `name`: String
- `bio`: String (maxlength 160)
- `website`: String (maxlength 200, default "")
- `avatar`: String (base64 data URL)
- `resetPasswordTokenHash`: String, select: false (хеш токена сброса пароля)
- `resetPasswordExpiresAt`: Date, select: false (срок действия токена сброса)
- `createdAt`, `updatedAt`: Date (timestamps)

Индексы:
- Unique: `email`
- Unique: `username`

Связи:
- `User` связан с `Post`, `Comment`, `Like`, `Follow`, `Notification` через поля `authorId`, `userId`, `actorId`.

## Post
Назначение: публикация пользователя.

Поля:
- `_id`: ObjectId
- `authorId`: ObjectId → User
- `image`: String (base64 data URL)
- `caption`: String
- `createdAt`, `updatedAt`: Date

Индексы:
- `authorId`
- `createdAt` (для сортировки ленты)

Связи:
- `Post` имеет `Like` и `Comment`.

## Like
Назначение: лайк поста.

Поля:
- `_id`: ObjectId
- `userId`: ObjectId → User
- `postId`: ObjectId → Post
- `createdAt`: Date

Индексы:
- Unique составной: `{ userId: 1, postId: 1 }` (запрет дублей)

## Comment
Назначение: комментарий к посту.

Поля:
- `_id`: ObjectId
- `userId`: ObjectId → User
- `postId`: ObjectId → Post
- `text`: String (required, maxlength 500)
- `likes`: [ObjectId → User] (массив ID пользователей, лайкнувших комментарий, default [])
- `createdAt`, `updatedAt`: Date

Индексы:
- `postId`
- `userId`
- `createdAt`

## Follow
Назначение: подписка одного пользователя на другого.

Поля:
- `_id`: ObjectId
- `followerId`: ObjectId → User
- `followingId`: ObjectId → User
- `createdAt`: Date

Индексы:
- Unique составной: `{ followerId: 1, followingId: 1 }` (запрет дублей)
- `followerId`
- `followingId`

## Notification
Назначение: уведомления о действиях.

Поля:
- `_id`: ObjectId
- `userId`: ObjectId → User (получатель)
- `type`: String enum: `like | comment | follow | like_comment`
- `entityId`: ObjectId (id поста/комментария/пользователя)
- `actorId`: ObjectId → User (инициатор события)
- `read`: Boolean (default: false)
- `createdAt`: Date

Индексы:
- `userId`
- `createdAt`
- `read`

## Message (опционально)
Назначение: сообщение для чата.

Поля:
- `_id`: ObjectId
- `roomId`: String или ObjectId (идентификатор диалога)
- `senderId`: ObjectId → User
- `text`: String
- `createdAt`: Date

Индексы:
- `roomId`
- `createdAt`

