# StudyForge - Personal Study Tracker

> A study tracker with enhancements: rustiness decay, spaced repetition reviews, certification tracking, monthly/annual planning — organized across Academy (CS) and Industry (Software Dev) domains.

**Tech Stack**: Next.js 16 (App Router) + TanStack Query | Rails 8 API-only | PostgreSQL | Devise + JWT | CSS Modules

**Scope**: Single user (personal use), with auth for security.

### Progress
- [x] **Sprint 1: Foundation** — completed 2026-02-08
- [ ] Sprint 2: Core Tracking
- [ ] Sprint 3: Planning
- [ ] Sprint 4: Certs & Resources
- [ ] Sprint 5: Dashboard & Polish

---

## Phase 1: Project Scaffolding

### Monorepo structure

```
study-forge/
├── backend/                  # Rails API
│   ├── Gemfile
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   ├── models/
│   │   ├── serializers/
│   │   └── services/
│   └── db/migrations/
├── frontend/                 # Next.js
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Shared UI components
│   │   ├── lib/              # API client, utils
│   │   └── hooks/            # TanStack Query hooks
│   ├── package.json
│   └── tailwind.config.ts
├── docker-compose.yml        # Postgres + Rails + Next.js
└── README.md
```

### Steps
1. `rails new backend --api --database=postgresql --skip-test` (use RSpec)
2. `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir`
3. Add `shadcn/ui` for UI components
4. Create `docker-compose.yml` with Postgres, Rails, and Next.js services

---

## Phase 2: Data Model & Migrations

### `users`
| Column | Type | Notes |
|--------|------|-------|
| email | string | Devise default |
| encrypted_password | string | Devise default |
| jti | string | JWT revocation (devise-jwt) |

### `topics`
| Column | Type | Notes |
|--------|------|-------|
| name | string | e.g. "Data Structures", "Kubernetes" |
| category | enum | `academy`, `industry` |
| subcategory | string | academy: algorithms, os, networks, db, math / industry: backend, frontend, infra, observability, devops, stacks |
| description | text | |
| parent_topic_id | bigint | nullable, self-referential for hierarchy (e.g. "Trees" under "Data Structures") |
| decay_rate | float | default 0.05 — higher = forgets faster. Configurable per topic |
| last_practiced_at | datetime | updated when user logs study/review |
| proficiency_level | enum | `beginner`, `familiar`, `proficient`, `expert` |

### `annual_goals`
| Column | Type | Notes |
|--------|------|-------|
| year | integer | e.g. 2026 |
| title | string | e.g. "Master system design" |
| description | text | |
| goal_type | enum | `academy`, `industry`, `certification`, `general` |
| status | enum | `not_started`, `in_progress`, `completed`, `abandoned` |
| target_date | date | |
| progress_pct | integer | 0-100 |

### `monthly_plans`
| Column | Type | Notes |
|--------|------|-------|
| year | integer | |
| month | integer | 1-12 |
| title | string | optional theme: "Distributed Systems Month" |
| notes | text | |
| status | enum | `draft`, `active`, `completed`, `reviewed` |

### `monthly_plan_items`
| Column | Type | Notes |
|--------|------|-------|
| monthly_plan_id | bigint | FK |
| topic_id | bigint | FK |
| annual_goal_id | bigint | FK, nullable — links item to a goal |
| description | text | what specifically to study |
| target_hours | float | planned hours |
| actual_hours | float | logged hours |
| status | enum | `pending`, `in_progress`, `completed`, `skipped` |
| position | integer | ordering |

### `review_sessions`
| Column | Type | Notes |
|--------|------|-------|
| topic_id | bigint | FK |
| scheduled_date | date | when the review is due |
| completed_date | date | nullable |
| quality_rating | integer | 0-5 (SM-2: 0=forgot everything, 5=perfect recall) |
| interval_days | integer | current interval (starts at 1, grows with SM-2) |
| ease_factor | float | SM-2 ease factor, default 2.5 |
| repetition_number | integer | how many times reviewed |
| status | enum | `scheduled`, `completed`, `missed`, `skipped` |
| notes | text | |

### `certifications`
| Column | Type | Notes |
|--------|------|-------|
| name | string | e.g. "AWS Solutions Architect Associate" |
| provider | string | e.g. "AWS", "CNCF", "Google" |
| status | enum | `interested`, `studying`, `scheduled`, `passed`, `failed`, `expired` |
| exam_date | date | nullable |
| obtained_date | date | nullable |
| expiry_date | date | nullable |
| study_progress_pct | integer | 0-100 |
| cost | decimal | exam cost |
| notes | text | |
| url | string | link to cert page |

### `resources`
| Column | Type | Notes |
|--------|------|-------|
| topic_id | bigint | FK |
| title | string | e.g. "CLRS - Introduction to Algorithms" |
| resource_type | enum | `book`, `documentation`, `course`, `video`, `article`, `tool` |
| url | string | nullable |
| author | string | nullable |
| description | text | |
| is_recommended | boolean | curated flag |
| progress_pct | integer | 0-100 |

### `study_logs`
| Column | Type | Notes |
|--------|------|-------|
| topic_id | bigint | FK |
| monthly_plan_item_id | bigint | FK, nullable |
| date | date | |
| hours | float | |
| notes | text | |
| log_type | enum | `study`, `review`, `practice`, `project` |

> Triggers update to `topics.last_practiced_at` via ActiveRecord callback.

---

## Phase 3: Core Backend (Rails API)

### Key Gems
```ruby
gem 'devise'
gem 'devise-jwt'
gem 'jsonapi-serializer'
gem 'rack-cors'
gem 'rspec-rails'
gem 'factory_bot_rails'
gem 'pg'
gem 'kaminari'
```

### API Routes (`/api/v1/`)
```ruby
namespace :api do
  namespace :v1 do
    devise_for :users, controllers: {
      sessions: 'api/v1/sessions',
      registrations: 'api/v1/registrations'
    }

    resources :topics do
      resources :resources, shallow: true
      resources :review_sessions, shallow: true
      member { post :log_practice }
      collection { get :rusty }
    end

    resources :annual_goals
    resources :monthly_plans do
      resources :monthly_plan_items, shallow: true
    end
    resources :certifications
    resources :review_sessions, only: [:index, :update] do
      collection { get :upcoming }
      member { post :complete }
    end
    resources :study_logs
    resources :resources, only: [:index]

    get 'dashboard', to: 'dashboard#show'
  end
end
```

### Key Services

#### `RustinessService` — Knowledge Decay Algorithm
```
freshness = e^(-decay_rate * days_since_practice)

Scale: 0.0 (completely rusty) → 1.0 (just practiced)

Thresholds:
  > 0.7  = Fresh (green)
  0.4-0.7 = Fading (yellow)
  < 0.4  = Rusty (orange)
  < 0.15 = Very Rusty (red)

With default decay_rate 0.05:
  7 days  → 0.70 (fresh)
  14 days → 0.50 (fading)
  30 days → 0.22 (rusty)
  60 days → 0.05 (very rusty)

Higher decay_rate (0.1) = memorization-heavy topics that fade fast
Lower decay_rate (0.02) = deep conceptual topics that stick longer
```

#### `ReviewSchedulerService` — SM-2 Spaced Repetition
```
On review with quality q (0-5):

If q >= 3 (recalled):
  rep 1 → interval = 1 day
  rep 2 → interval = 6 days
  rep 3+ → interval = prev_interval * ease_factor
  Ease update: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  Minimum EF = 1.3

If q < 3 (forgot):
  Reset to rep 1, interval = 1 day, keep ease factor

Next review = completed_date + interval_days
```

### Dashboard Controller
Aggregated JSON response:
- Current month plan summary + completion %
- Upcoming reviews (next 7 days)
- Top 5 rustiest topics
- Annual goals progress
- Certifications nearing expiry (< 90 days)
- Study streak (consecutive days with study_logs)

---

## Phase 4: Frontend (Next.js)

### UI Stack
- **CSS Modules** (no Tailwind)
- **Recharts** for charts
- **Lucide** icons
- **TanStack Query** for server state
- **date-fns** for dates

### App Router Structure
```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx
├── (app)/                          # Authenticated layout
│   ├── layout.tsx                  # Sidebar + header
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── topics/
│   │   ├── page.tsx                # All topics (filterable)
│   │   └── [id]/page.tsx           # Topic detail + rustiness gauge
│   ├── goals/
│   │   ├── page.tsx                # Annual goals
│   │   └── [id]/page.tsx           # Goal detail
│   ├── monthly-plans/
│   │   ├── page.tsx                # Calendar view
│   │   └── [id]/page.tsx           # Plan detail + checklist
│   ├── reviews/
│   │   ├── page.tsx                # Upcoming + overdue
│   │   └── [id]/page.tsx           # Review session
│   ├── certifications/
│   │   ├── page.tsx                # Cert tracker
│   │   └── [id]/page.tsx           # Cert detail + timeline
│   ├── resources/page.tsx          # Resource library
│   ├── study-log/page.tsx          # Daily log + heatmap
│   └── settings/page.tsx           # Preferences
└── layout.tsx                      # Root (providers)
```

### API Client (`src/lib/api-client.ts`)
- Axios instance with JWT interceptor
- 401 → redirect to login
- JSON:API response unwrapping

### TanStack Query Hooks (`src/hooks/`)
- `useTopics` — CRUD + `useRustyTopics()`
- `useGoals` — CRUD + progress
- `useMonthlyPlans` — CRUD + items
- `useReviews` — upcoming, complete, reschedule
- `useCertifications` — CRUD
- `useResources` — CRUD + search
- `useStudyLogs` — CRUD
- `useDashboard` — aggregated data

### Key UI Components
- **RustinessGauge** — circular gauge (green → yellow → red)
- **ReviewCard** — topic, due date, urgency, "Start Review" button
- **GoalProgressBar** — annual goal with % complete
- **MonthlyCalendar** — grid with planned items
- **TopicTree** — hierarchical view with Academy | Industry tabs
- **CertTimeline** — visual cert lifecycle
- **StudyStreak** — GitHub-style heatmap of daily activity

---

## Phase 5: Seed Data

### Academy Topics (CS Fundamentals)
| Topic | Subtopics | Books |
|-------|-----------|-------|
| Data Structures | Arrays, Linked Lists, Trees, Graphs, Hash Tables, Heaps | CLRS, "The Algorithm Design Manual" (Skiena) |
| Algorithms | Sorting, Searching, DP, Greedy, Graph Algorithms | CLRS, "Algorithm Design" (Kleinberg & Tardos) |
| Operating Systems | Processes, Memory, File Systems, Scheduling, Concurrency | "OSTEP" (free), "Modern Operating Systems" (Tanenbaum) |
| Computer Networks | TCP/IP, HTTP, DNS, Sockets, TLS, Load Balancing | "Computer Networking: A Top-Down Approach" (Kurose & Ross) |
| Databases | SQL, Indexing, Transactions, Normalization | "Designing Data-Intensive Applications" (Kleppmann) |
| Distributed Systems | Consensus, CAP, Replication, Partitioning | DDIA (Kleppmann), "Designing Distributed Systems" (Burns) |
| System Design | Scalability, Caching, Message Queues, Microservices | "System Design Interview" (Alex Xu) |
| Discrete Math | Logic, Set Theory, Combinatorics, Probability | "Discrete Mathematics and Its Applications" (Rosen) |

### Industry Topics (Software Dev)
| Subcategory | Topics | Docs |
|-------------|--------|------|
| Backend | Ruby/Rails, Node.js, Go, REST, GraphQL | Rails Guides, Go docs, MDN HTTP |
| Frontend | React, Next.js, TypeScript, CSS/Tailwind | React docs, Next.js docs, MDN |
| Infrastructure | Docker, Kubernetes, Terraform, CI/CD, AWS/GCP | K8s docs, Terraform docs, AWS docs |
| Observability | Logging, Metrics, Tracing, Prometheus, Grafana, OTel | OpenTelemetry docs, Prometheus docs |
| DevOps | Git, Linux, Bash, Security basics | Pro Git, Linux man pages |
| Stacks | Rails+React, MERN, Go+HTMX | Framework docs |

### Common Certifications
- AWS Solutions Architect (Associate / Professional)
- AWS Developer Associate
- CKA (Certified Kubernetes Administrator)
- CKAD (Certified Kubernetes Application Developer)
- Terraform Associate
- Google Cloud Professional Cloud Architect
- CompTIA Security+

---

## Phase 6: Implementation Order (MVP → Full)

### Sprint 1: Foundation ~~DONE~~
1. ~~Scaffold Rails API + Next.js~~ (no Docker — using local Postgres)
2. ~~Devise + JWT auth~~
3. ~~All database migrations (8 tables)~~
4. ~~Topic CRUD (model, controller, serializer)~~
5. ~~API client + auth flow in frontend~~
6. ~~Topics page with category tabs~~

### Sprint 2: Core Tracking
7. RustinessService + rusty topics endpoint
8. ReviewSchedulerService + review_sessions CRUD
9. RustinessGauge + Reviews page
10. Annual Goals CRUD + GoalProgressBar

### Sprint 3: Planning
11. Monthly Plans + Plan Items CRUD
12. Monthly Plans page (calendar/checklist)
13. Study Logs + last_practiced_at callback
14. Study Log page + heatmap
15. Plan items → goals progress rollup

### Sprint 4: Certs & Resources
16. Certifications CRUD + tracker page
17. Resources CRUD + library page
18. Seed data (topics, books, docs, certs)

### Sprint 5: Dashboard & Polish
19. Dashboard aggregate endpoint
20. Dashboard page (all widgets)
21. Search/filtering
22. Responsive design
23. Error/loading/empty states

---

## Verification

1. **Backend**: `bundle exec rspec` — models, services, request specs
2. **Frontend**: Each page renders with mock data, then live API
3. **Integration flow**: Login → create topic → log study → rustiness updates → schedule review → complete review → interval grows
4. **Docker**: `docker-compose up` → app at `localhost:3000`
