# Feature guides (how‑to)

Навигация: [README.md](README.md) → [06-frontend-architecture.md](06-frontend-architecture.md) → [08-testing-checklist.md](08-testing-checklist.md)

## Профиль
Backend:
1. `GET /users/:id` возвращает профиль без пароля.
2. `PATCH /users/:id` обновляет `name`, `bio`, `username`, `email`.
3. `PATCH /users/:id/avatar` принимает `FormData` с `image`.

Frontend:
1. Страница `/profile/:id` выводит данные и посты пользователя.
2. Форма `/profile/:id/edit` вызывает PATCH и показывает ошибки.
3. Загрузка аватара через input type="file" и FormData.

## Посты
Backend:
1. `POST /posts` — создание поста с изображением.
2. `GET /posts` — лента.
3. `GET /posts/:id` — детали.
4. `PATCH /posts/:id` — обновление подписи.
5. `DELETE /posts/:id` — удаление.

Frontend:
1. Страница создания поста отправляет `FormData`.
2. Лента отображает массив `items`.
3. Детальная страница использует `GET /posts/:id`.

## Лайки и комментарии
Backend:
1. `POST /posts/:id/like` — toggle like поста.
2. `POST /comments/:commentId/like` — toggle like комментария.
3. `POST /posts/:id/comments` — добавление комментария.
4. `GET /posts/:id/comments` — список.

Frontend:
1. Кнопка лайка меняет состояние локально после ответа (хук `useLikeToggle`).
2. Комментарии подгружаются с пагинацией.
3. Лайки комментариев хранятся как массив userId в модели Comment.

## Поиск и Explore
Backend:
1. `GET /search/users?q=...`.
2. `GET /explore/posts?limit=...` — случайные посты.

Frontend:
1. Поиск запускается по вводу, показывает список пользователей.
2. Explore — плитка постов (grid) с случайным порядком.

## Подписки
Backend:
1. `POST /users/:id/follow` — follow/unfollow.
2. `GET /users/:id/followers` и `/following`.

Frontend:
1. Кнопка follow меняется по ответу `following`.
2. Списки подписчиков/подписок показываются в профиле.

## Уведомления
Backend:
1. Создаются на like/comment/follow/like_comment.
2. `GET /notifications` — список уведомлений.
3. `GET /notifications/unread-count` — количество непрочитанных.
4. `PATCH /notifications/:id/read` — пометить прочитанным.
5. `DELETE /notifications/:id` — удалить уведомление.

Frontend:
1. Страница уведомлений сортируется по дате.
2. Непрочитанные выделены визуально.
3. Счётчик непрочитанных отображается в sidebar.

