# Employee Review Project

Fullstack-приложение для процесса оценки сотрудников: HR назначает оценку, reviewer отправляет ее на согласование, manager утверждает или отклоняет.

## Технологии

- **Backend:** Django + Django REST Framework + Djoser + JWT
- **Database:** PostgreSQL
- **Frontend:** React + Vite + MUI
- **Infrastructure:** Docker + Docker Compose

## Роли и workflow

- **HR (`is_hr`)**: назначает и редактирует оценки сотрудников.
- **Reviewer (`is_reviewer`)**: работает со своими назначенными оценками и отправляет их.
- **Manager (`is_manager`)**: согласовывает или отклоняет отправленные оценки.

Статусы оценки:

- `draft`
- `submitted`
- `approved`
- `rejected`

## API namespace

- `api/employees/` - подразделения и сотрудники
- `api/evaluations/` - оценки сотрудников и workflow-действия
- `api/auth/` - регистрация, логин и JWT

## Запуск с Docker

1. Запустите сервисы:

```bash
docker compose up --build
```

2. Создайте суперпользователя:

```bash
docker compose exec backend python manage.py createsuperuser
```

3. Заполните БД демо-данными:

```bash
docker compose exec backend python manage.py seed_hr_demo
```

4. Откройте приложение:

- Frontend: [http://localhost:5173/](http://localhost:5173/)
- Admin: [http://localhost:8000/admin/](http://localhost:8000/admin/)
- API root: [http://localhost:8000/api/](http://localhost:8000/api/)

## Локальная разработка без Docker

### Backend

1. `cd backend`
2. `python -m venv .venv`
3. Активируйте окружение:
   - Windows: `.venv\Scripts\activate`
   - Linux/macOS: `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `python manage.py migrate`
6. `python manage.py runserver`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Smoke-сценарий оценки

Минимальная проверка end-to-end:

1. HR создает/назначает оценку через `POST /api/evaluations/`.
2. Reviewer отправляет оценку через `POST /api/evaluations/{id}/submit/`.
3. Manager согласовывает оценку через `POST /api/evaluations/{id}/approve/` (или отклоняет через `reject`).
4. Проверяем, что итоговый `status` стал `approved` или `rejected`.

Рекомендуемый набор тестовых пользователей (создаются командой `seed_hr_demo`):

- `hr_lead` c `is_hr=true`
- `reviewer_ivan` c `is_reviewer=true`
- `manager_olga` c `is_manager=true`
- Пароль для всех: `DemoPass123!`
