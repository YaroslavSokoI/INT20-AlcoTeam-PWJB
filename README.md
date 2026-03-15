# BetterMe Wellness Platform

Повноцінна wellness-платформа з адмін-панеллю для побудови персоналізованих wellness-потоків та користувацьким додатком, який проводить користувача через квіз і рекомендує індивідуальні пропозиції.

## Архітектура

```
                          ┌──────────────────────────────────────┐
                          │            Caddy (:80)               │
                          │         reverse proxy                │
                          └──┬──────┬──────────┬──────────┬──────┘
                             │      │          │          │
                          /admin  /admin/api  /api     /* (root)
                             │      │          │          │
               ┌─────────────┘      │          │          └─────────────┐
               ▼                    ▼          ▼                        ▼
      Admin Frontend         Admin Backend   App Backend          App Frontend
     (React, :5173)          (Express, :3001) (Express, :3002)    (React, :5174)
               │                    │          │                        │
               │                    └────┬─────┘                       │
               │                         ▼                             │
               │                   PostgreSQL (:5432)                  │
               │                    (betterme DB)                      │
               └───────────────────────────────────────────────────────┘
```

Проект складається з 4 модулів:

| Модуль | Шлях | Опис |
|--------|------|------|
| **Admin Frontend** | `WellnesAdmin-frontend/` | React-дашборд для побудови wellness-квізів (графовий редактор) |
| **Admin Backend** | `WellnessAdmin-backend/` | REST API для управління вузлами, ребрами, пропозиціями, адмінами, аналітикою |
| **App Frontend** | `WellnessApp-frontend/` | Користувацький wellness-квіз з підтримкою i18n |
| **App Backend** | `WellnessApp-backend/` | REST API для квіз-сесій, відповідей, підбору пропозицій |

## Технології

### Frontend
- **React 19** + **TypeScript**
- **Vite** (збірка)
- **Tailwind CSS 4** (стилізація)
- **Zustand** + **Immer** (управління станом, адмінка)
- **TanStack React Query** (запити до API, адмінка)
- **@xyflow/react** + **Dagre** (графовий редактор, адмінка)
- **Framer Motion** (анімації)
- **Radix UI** (доступні UI-компоненти, адмінка)
- **i18next** (інтернаціоналізація, додаток)
- **Zod** (валідація, адмінка)
- **Recharts** (графіки аналітики, адмінка)

### Backend
- **Node.js 20** + **TypeScript**
- **Express 4** (HTTP-фреймворк)
- **PostgreSQL 16** (база даних)
- **Jest 29** + **ts-jest** + **Supertest** (тестування)
- **Swagger UI Express** (документація API)
- **bcrypt** (хешування паролів, авторизація адмінів)
- **ua-parser-js** (парсинг user agent, аналітика)

### Інфраструктура
- **Docker Compose** (оркестрація)
- **Caddy 2** (reverse proxy)
- **Nginx** (роздача статики фронтенду в production)

## Вимоги

- **Node.js** >= 20
- **Docker** та **Docker Compose** (для контейнеризованого запуску)
- **PostgreSQL 16** (для локального запуску без Docker)

## Локальний запуск проекту

Найшвидший спосіб запустити всю платформу:

```bash
# 1. Клонувати репозиторій
git clone <repo-url>
cd INT20-MainComp

# 2. Створити файл змінних оточення
cp .env.example .env

# 3. Запустити всі сервіси
docker compose up --build
```

Після запуску сервіси доступні за адресами:

| Сервіс | URL |
|--------|-----|
| Додаток (квіз) | http://localhost (або http://localhost:5174) |
| Адмін-панель | http://localhost/admin (або http://localhost:5175) |
| API документація додатку (Swagger) | http://localhost/api-docs |
| PostgreSQL | localhost:5432 |

Зупинити:

```bash
docker compose down
```

Скинути базу даних (видаляє всі дані):

```bash
docker compose down -v
docker compose up --build
```

## Структура проекту

```
INT20-MainComp/
├── WellnesAdmin-frontend/          # Адмін-панель (React)
│   ├── src/
│   │   ├── components/             # UI-компоненти (Canvas, InspectorPanel, Modals...)
│   │   ├── pages/                  # Сторінки маршрутів (lazy loaded)
│   │   ├── store/                  # Zustand stores (flowStore, authStore)
│   │   ├── services/               # API-клієнт (fetchAdmin wrapper)
│   │   ├── types/                  # TypeScript інтерфейси
│   │   └── hooks/                  # Кастомні React хуки
│   └── vite.config.ts
│
├── WellnessAdmin-backend/          # Admin API (Express)
│   ├── src/
│   │   ├── routes/                 # Express роутери (nodes, edges, offers, admins, analytics, publish)
│   │   ├── services/               # Бізнес-логіка (rule-engine, graph, admin service)
│   │   ├── types/                  # TypeScript інтерфейси
│   │   ├── db/                     # Клієнт бази даних (pg pool)
│   │   ├── swagger.ts              # OpenAPI специфікація
│   │   └── index.ts                # Точка входу
│   └── jest.config.js
│
├── WellnessApp-frontend/           # Користувацький квіз (React)
│   ├── src/
│   │   ├── components/             # UI-компоненти
│   │   ├── hooks/                  # useQuiz хук
│   │   ├── types/                  # TypeScript інтерфейси
│   │   └── i18n/                   # Конфіг локалізації + переклади
│   └── vite.config.ts
│
├── WellnessApp-backend/            # User API (Express)
│   ├── src/
│   │   ├── routes/                 # Express роутери (сесії, відповіді, пропозиції)
│   │   ├── services/               # Бізнес-логіка (rule-engine, підбір пропозицій)
│   │   ├── types/                  # TypeScript інтерфейси
│   │   ├── db/                     # Клієнт бази даних (pg pool)
│   │   ├── swagger.ts              # OpenAPI специфікація
│   │   └── index.ts                # Точка входу
│   └── jest.config.js
│
├── db/                             # SQL міграції та seed-дані
│   ├── 001_init.sql                # Основна схема (nodes, edges, offers, sessions, answers)
│   ├── 002_seed.sql                # Початкові дані
│   ├── 006_published_tables.sql    # Read-only опубліковані таблиці
│   ├── 007_offer_accepted.sql      # Відстеження прийняття пропозицій
│   ├── 008_translations.sql        # Підтримка багатомовності
│   └── 009_seed_translations.sql   # Seed-дані перекладів
│
├── docker-compose.yml              # Оркестрація всіх сервісів
├── Caddyfile                       # Конфігурація reverse proxy
└── .env.example                    # Шаблон змінних оточення
```

## Rule Engine

Платформа використовує власний rule engine для умовної маршрутизації потоку та персоналізованого підбору пропозицій. Rule engine оцінює атрибути користувача (зібрані під час квізу) відносно умов, визначених на ребрах графу та пропозиціях.

### Типи умов

**Проста умова (Simple)** — перевіряє один атрибут:

```json
{
  "type": "simple",
  "attribute": "goal",
  "op": "eq",
  "value": "weight_loss"
}
```

**Складена умова (Compound)** — комбінує декілька умов через AND/OR:

```json
{
  "type": "compound",
  "operator": "AND",
  "conditions": [
    { "type": "simple", "attribute": "goal", "op": "eq", "value": "weight_loss" },
    { "type": "simple", "attribute": "context", "op": "eq", "value": "home" }
  ]
}
```

### Вибір ребра (Edge Resolution)

Коли користувач відповідає на питання, rule engine оцінює всі вихідні ребра з поточного вузла:

1. Ребра сортуються за `priority` (спадання) — ребра з вищим пріоритетом перевіряються першими
2. Ребра з `conditions: null` є fallback-ребрами за замовчуванням (перевіряються останніми)
3. Обирається перше ребро, умова якого збігається з накопиченими атрибутами користувача
4. Якщо жодне ребро не збіглося, квіз-сесія завершується

### Підбір пропозицій (Offer Resolution)

Після завершення квізу пропозиції підбираються аналогічно:

1. Завантажуються всі пропозиції, відсортовані за `offer_priority` (спадання)
2. `offer_conditions` кожної пропозиції оцінюються відносно атрибутів сесії
3. Всі пропозиції, що збіглися, повертаються як `primary`

## API документація

Інтерактивний Swagger UI доступний за `/api-docs` на обох бекендах:

- **Admin API**: `http://localhost:3001/api-docs`
- **App API**: `http://localhost:3002/api-docs`

### Основні ендпоінти

#### App Backend (користувацький)

| Метод | Ендпоінт | Опис |
|-------|----------|------|
| POST | `/api/user/sessions` | Створити нову квіз-сесію |
| GET | `/api/user/sessions/:id` | Отримати стан сесії (для відновлення) |
| POST | `/api/user/sessions/:id/answer` | Надіслати відповідь, отримати наступний вузол |
| POST | `/api/user/sessions/:id/back` | Повернутися до попереднього питання |
| GET | `/api/user/sessions/:id/offer` | Отримати персоналізовану пропозицію (після завершення) |
| POST | `/api/user/sessions/:id/accept-offer` | Позначити пропозицію як прийняту |

#### Admin Backend

| Метод | Ендпоінт | Опис |
|-------|----------|------|
| GET | `/api/admin/graph` | Отримати повний DAG (вузли + ребра) |
| CRUD | `/api/admin/nodes` | Управління вузлами квізу |
| CRUD | `/api/admin/edges` | Управління ребрами з умовами |
| CRUD | `/api/admin/offers` | Управління wellness-пропозиціями |
| CRUD | `/api/admin/admins` | Управління адмін-користувачами |
| GET | `/api/admin/analytics` | Перегляд аналітики квізу |
| POST | `/api/admin/publish` | Опублікувати чернетку графу в production |
| GET | `/api/content/graph` | Read-only опублікований граф (для app frontend) |

## Тестування

Тести написані на **Jest** та **Supertest**:

```bash
# Запустити тести App Backend (36 тестів)
cd WellnessApp-backend
npm test

# Запустити тести Admin Backend (18 тестів)
cd WellnessAdmin-backend
npm test

# Запустити з детальним виводом
npm test -- --verbose
```

### Покриття тестами

| Модуль | Тести | Що покрито |
|--------|-------|------------|
| Rule Engine (Admin) | 18 | Прості/складені умови, всі оператори, вкладеність, пріоритет ребер |
| Rule Engine (App) | 9 | Прості/складені умови, AND/OR, вибір ребра |
| Offer Service | 6 | Збіг пропозицій, виключення, catch-all, складені умови |
| User Routes | 21 | Всі ендпоінти: сесії, відповіді, навігація назад, пропозиції (happy + error paths) |

## База даних

PostgreSQL 16 з наступними основними таблицями:

| Таблиця | Опис |
|---------|------|
| `nodes` | Вузли квізу (question, info, offer, conditional) |
| `edges` | Направлені ребра між вузлами з умовами та пріоритетом |
| `offers` | Wellness-пропозиції з умовами для персоналізованого підбору |
| `sessions` | Квіз-сесії користувачів з накопиченими атрибутами |
| `answers` | Окремі відповіді за сесіями |
| `admins` | Адмін-користувачі (bcrypt-хешовані паролі) |
| `published_nodes` / `published_edges` | Read-only знімок графу для користувацького додатку |

Міграції застосовуються автоматично Docker Compose при першому запуску. Для ручного налаштування застосуйте SQL-файли з папки `db/` по порядку.

## Змінні оточення

| Змінна | За замовчуванням | Опис |
|--------|------------------|------|
| `DB_USER` | `betterme` | Ім'я користувача PostgreSQL |
| `DB_PASSWORD` | `betterme_secret` | Пароль PostgreSQL |
| `DB_NAME` | `betterme` | Назва бази даних PostgreSQL |
| `DB_HOST` | `db` | Хост бази даних (`localhost` для локальної розробки) |
| `DB_PORT` | `5432` | Порт бази даних |
| `DATABASE_URL` | --- | Повний connection string (використовується бекендами) |
| `PORT` | `3001` / `3002` | Порт бекенд-сервера |
