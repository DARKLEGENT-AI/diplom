# МедУчет Backend

Backend для веб-системы учета медицинского учреждения: авторизация, роли, врачи, пациенты, услуги, расписание приемов и отчеты.

## Стек

- NestJS
- TypeORM
- PostgreSQL
- JWT
- bcrypt

## Запуск

```bash
npm install
npm run start:dev
```

Production-сборка:

```bash
npm run build
npm run start
```

## Переменные окружения

Файл `.env`:

```env
NODE_ENV=development
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres

JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
```

API доступен с префиксом `/v1`.

## Основная логика

- Пациент видит врачей, выбирает день и свободное окно приема.
- Врач управляет своим расписанием и профилем специалиста.
- При создании врача автоматически открываются окна приема на 2 недели.
- Занятые окна не удаляются физически, а переводятся в статус `cancelled`.
- Пароли сохраняются в хешированном виде.

## Ключевые endpoints

Авторизация:

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/auth/me`

Пользователь:

- `POST /v1/users/me/avatar`
- `POST /v1/users/me/location`
- `POST /v1/users/me/doctor-profile`

Медицина:

- `GET /v1/medical/doctors`
- `GET /v1/medical/appointment-slots/free`
- `GET /v1/medical/appointment-slots/my`
- `GET /v1/medical/appointment-slots/doctor/my`
- `POST /v1/medical/appointment-slots`
- `PATCH /v1/medical/appointment-slots/:id`
- `DELETE /v1/medical/appointment-slots/:id`
- `POST /v1/medical/appointment-slots/:id/book`
- `GET /v1/medical/services`
- `GET /v1/medical/statistics/month`
