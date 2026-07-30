# StoryWriter Technical Design Document

## 1. Product Scope

StoryWriter is a browser-based story writing application for planning and drafting long-form fiction. The MVP should support:

- Email/password authentication
- Multiple works per user
- Chapter and scene organization
- Linked story entities such as characters, timeline events, and plot beats
- Notes for loose writing and research
- REST-based communication between frontend and backend
- A clean architecture that can evolve from SQLite to PostgreSQL with minimal schema or code changes

## 2. Architecture Overview

The system should be split into two independently deployable applications:

- Frontend: Next.js 15, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python, SQLAlchemy, SQLite for MVP

Recommended architecture style:

- Frontend as a presentation and orchestration layer
- Backend as a domain and data access layer
- Database access isolated behind repository abstractions
- Domain logic separated from persistence concerns
- API contracts typed end-to-end where practical

This separation makes it easier to later add:

- PostgreSQL
- Background jobs
- Rich collaboration features
- Full-text search
- Export/import workflows

## 3. Folder Structure

A clean monorepo layout is recommended:

```text
storywriter/
├─ frontend/
│  ├─ app/
│  ├─ components/
│  ├─ features/
│  ├─ lib/
│  ├─ hooks/
│  ├─ types/
│  ├─ styles/
│  ├─ public/
│  ├─ tests/
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ next.config.ts
├─ backend/
│  ├─ app/
│  │  ├─ api/
│  │  ├─ core/
│  │  ├─ domain/
│  │  ├─ infrastructure/
│  │  ├─ services/
│  │  ├─ schemas/
│  │  └─ main.py
│  ├─ migrations/
│  ├─ tests/
│  ├─ pyproject.toml
│  └─ alembic.ini
├─ docs/
│  ├─ architecture.md
│  ├─ api.md
│  └─ domain.md
├─ .env.example
└─ README.md
```

Suggested responsibilities:

- `frontend/app`: routes, layouts, and page composition
- `frontend/components`: reusable UI components
- `frontend/features`: work-specific feature modules
- `frontend/lib`: API client, auth helpers, utilities
- `frontend/types`: shared TypeScript interfaces and API types
- `backend/app/domain`: pure business entities and rules
- `backend/app/services`: orchestration and use cases
- `backend/app/infrastructure`: database, auth, repositories
- `backend/app/api`: route handlers and request/response adapters
- `backend/app/schemas`: Pydantic DTOs for API payloads
- `backend/migrations`: Alembic migration history

## 4. Domain Model

The domain model should be centered around Work as the root aggregate.

### Core entities

- **Work**
  - title
  - premise
  - genre
  - status

- **Chapter**
  - belongs to Work
  - ordered within Work
  - contains ordered Scenes

- **Scene**
  - title
  - summary
  - content
  - status
  - word count
  - belongs to Chapter
  - linked characters
  - linked timeline events
  - linked plot beat

- **Character**
  - name
  - role
  - motivation
  - conflict
  - arc notes
  - associated with a Work

- **TimelineEvent**
  - title
  - summary
  - order
  - associated with a Work

- **PlotBeat**
  - title
  - description
  - order
  - associated with a Work

- **Note**
  - title
  - content
  - associated with a Work

### Recommended domain boundaries

- Work is the top-level ownership boundary
- Chapters, scenes, characters, events, plot beats, and notes all belong to a work
- A scene belongs to exactly one chapter
- A scene can link many characters and many timeline events
- A scene can reference one plot beat
- Ordering should be explicit and managed in the backend

## 5. Database Schema

Use UUID primary keys from the beginning. That helps future migration and avoids dependence on auto-increment behavior.

### Shared columns for most tables

- id: UUID primary key
- created_at: timestamp with timezone
- updated_at: timestamp with timezone
- deleted_at: nullable timestamp for soft delete if needed later

Soft delete is optional for MVP, but keeping `deleted_at` available is useful for writing apps where accidental deletion matters.

### Tables

#### `users`

- id
- email
- password_hash
- is_active
- created_at
- updated_at

Constraints:

- email unique
- password_hash never stored in plain text

#### `works`

- id
- user_id
- title
- premise
- genre
- status
- created_at
- updated_at
- deleted_at

Constraints:

- user_id foreign key to users
- title indexed for quick listing
- status as a controlled string or enum-like field

#### `chapters`

- id
- work_id
- title
- order_index
- created_at
- updated_at
- deleted_at

Constraints:

- work_id foreign key to works
- order_index unique per work
- chapters sorted by order_index

#### `scenes`

- id
- chapter_id
- title
- summary
- content
- status
- order_index
- word_count
- plot_beat_id nullable
- created_at
- updated_at
- deleted_at

Constraints:

- chapter_id foreign key to chapters
- order_index unique per chapter
- word_count stored denormalized for fast display
- plot_beat_id nullable foreign key to plot_beats

#### `characters`

- id
- work_id
- name
- role
- motivation
- conflict
- arc_notes
- created_at
- updated_at
- deleted_at

Constraints:

- work_id foreign key to works
- name indexed within a work

#### `timeline_events`

- id
- work_id
- title
- summary
- order_index
- created_at
- updated_at
- deleted_at

Constraints:

- work_id foreign key to works
- order_index unique per work

#### `plot_beats`

- id
- work_id
- title
- description
- order_index
- created_at
- updated_at
- deleted_at

Constraints:

- work_id foreign key to works
- order_index unique per work

#### `notes`

- id
- work_id
- title
- content
- created_at
- updated_at
- deleted_at

Constraints:

- work_id foreign key to works

#### `scene_characters`

Join table for many-to-many relation between scenes and characters.

- scene_id
- character_id
- created_at

Constraints:

- composite unique index on scene_id and character_id

#### `scene_timeline_events`

Join table for many-to-many relation between scenes and timeline events.

- scene_id
- timeline_event_id
- created_at

Constraints:

- composite unique index on scene_id and timeline_event_id

### Design choices for migration to PostgreSQL

To keep the schema portable:

- Use SQLAlchemy models rather than raw SQLite-specific SQL
- Avoid SQLite-only features such as flexible typing assumptions
- Store enums as strings in the database
- Use UUIDs as strings or native UUIDs through SQLAlchemy abstraction
- Keep timestamps in UTC
- Define constraints and indexes in migrations, not only in model code

### Indexing strategy

Recommended indexes:

- `users.email`
- `works.user_id`
- `works.status`
- `chapters.work_id` and `chapters.order_index`
- `scenes.chapter_id` and `scenes.order_index`
- `characters.work_id`
- `timeline_events.work_id` and `timeline_events.order_index`
- `plot_beats.work_id` and `plot_beats.order_index`
- `notes.work_id`

Optional future indexes:

- full-text indexes for `scene.content` and `note.content`
- search indexes for character names and work titles

## 6. Backend Architecture

Use a clean architecture style with clear separation between domain, application, and infrastructure concerns.

### Layer responsibilities

#### API layer

- Accept HTTP requests
- Validate input with Pydantic
- Convert domain errors into HTTP responses
- Never contain business logic

#### Application layer

- Implements use cases such as create work, update scene, reorder chapters
- Coordinates repositories and domain objects
- Enforces workflows and transactional boundaries

#### Domain layer

- Contains entities and invariants
- Owns business rules such as ordering, ownership, and linking constraints
- Avoids dependency on FastAPI, SQLAlchemy, or Pydantic

#### Infrastructure layer

- SQLAlchemy models
- Repository implementations
- Password hashing
- JWT or session handling
- Database session management

### Suggested backend module structure

- `app/api`
  - `auth.py`
  - `works.py`
  - `chapters.py`
  - `scenes.py`
  - `characters.py`
  - `timeline_events.py`
  - `plot_beats.py`
  - `notes.py`

- `app/domain`
  - `entities.py`
  - `value_objects.py`
  - `errors.py`
  - `repositories.py`

- `app/services`
  - `auth_service.py`
  - `work_service.py`
  - `chapter_service.py`
  - `scene_service.py`
  - `character_service.py`

- `app/infrastructure`
  - `db.py`
  - `models.py`
  - `repositories/`
  - `security.py`
  - `settings.py`

- `app/schemas`
  - `auth.py`
  - `work.py`
  - `chapter.py`
  - `scene.py`
  - `character.py`
  - `timeline_event.py`
  - `plot_beat.py`
  - `note.py`

### Backend design principles

- Use dependency injection for repositories and services
- Keep request DTOs separate from ORM models
- Return pagination for list endpoints from day one
- Prefer transactional updates for reorder operations
- Keep ownership checks in service layer
- Centralize error types and response mapping

### Authentication approach

For MVP, use email/password authentication with secure password hashing and cookie-based sessions or JWT in httpOnly cookies.

Recommended implementation direction:

- Password hashing: Argon2 or bcrypt
- Authentication transport: httpOnly cookie
- Session model: JWT access token plus refresh token, or server-side session if you want simpler revocation control
- CORS configured explicitly for frontend origin
- CSRF protections if using cookies for state-changing requests

If the app is primarily same-origin in production, cookie-based auth is usually the simplest browser experience.

## 7. Frontend Architecture

Use Next.js App Router with a feature-oriented structure.

### Suggested frontend structure

- `app`
  - `layout.tsx`
  - `page.tsx`
  - `login`
  - `register`
  - `dashboard`
  - `works`
  - `works/[workId]`
  - `works/[workId]/chapters`
  - `works/[workId]/scenes`
  - `works/[workId]/characters`
  - `works/[workId]/timeline`
  - `works/[workId]/notes`
  - `settings`

- `components`
  - `layout`
  - `navigation`
  - `forms`
  - `editor`
  - `lists`
  - `modals`
  - `empty-states`

- `features`
  - `auth`
  - `works`
  - `chapters`
  - `scenes`
  - `characters`
  - `timeline`
  - `notes`

- `lib`
  - `api-client`
  - `auth`
  - `query-client`
  - `utils`

- `types`
  - `api`
  - `domain`

### Frontend responsibilities

- Route and render application pages
- Manage local UI state
- Fetch data from backend via REST
- Validate forms on the client
- Provide editing experience for story content
- Keep typography and layout optimized for long-form writing

### State management approach

For MVP:

- Server state: TanStack Query or the built-in fetch cache patterns, with TanStack Query preferred for complex CRUD and optimistic updates
- Form state: React Hook Form
- Validation: Zod
- Global UI state: minimal custom state or lightweight store if needed

### UI patterns

The app should feel like a writing workspace, not a generic admin dashboard.

Recommended UI regions:

- Left sidebar for works and navigation
- Main editor canvas for scenes, notes, and chapters
- Right inspector panel for metadata, links, and status
- Modal or drawer for creation flows
- Focus mode for distraction-free writing

### Styling direction

- Tailwind CSS for component styling
- Use CSS variables for theme tokens
- Support a calm, editorial visual system
- Prioritize readability for long text and writing workflows
- Ensure responsive behavior on tablet and desktop

## 8. API Endpoint Design

Use REST endpoints organized around resources and work-scoped operations.

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Works

- `GET /works`
- `POST /works`
- `GET /works/{workId}`
- `PATCH /works/{workId}`
- `DELETE /works/{workId}`

### Chapters

- `GET /works/{workId}/chapters`
- `POST /works/{workId}/chapters`
- `GET /chapters/{chapterId}`
- `PATCH /chapters/{chapterId}`
- `DELETE /chapters/{chapterId}`
- `POST /works/{workId}/chapters/reorder`

### Scenes

- `GET /chapters/{chapterId}/scenes`
- `POST /chapters/{chapterId}/scenes`
- `GET /scenes/{sceneId}`
- `PATCH /scenes/{sceneId}`
- `DELETE /scenes/{sceneId}`
- `POST /chapters/{chapterId}/scenes/reorder`

### Characters

- `GET /works/{workId}/characters`
- `POST /works/{workId}/characters`
- `GET /characters/{characterId}`
- `PATCH /characters/{characterId}`
- `DELETE /characters/{characterId}`

### Timeline events

- `GET /works/{workId}/timeline-events`
- `POST /works/{workId}/timeline-events`
- `GET /timeline-events/{timelineEventId}`
- `PATCH /timeline-events/{timelineEventId}`
- `DELETE /timeline-events/{timelineEventId}`
- `POST /works/{workId}/timeline-events/reorder`

### Plot beats

- `GET /works/{workId}/plot-beats`
- `POST /works/{workId}/plot-beats`
- `GET /plot-beats/{plotBeatId}`
- `PATCH /plot-beats/{plotBeatId}`
- `DELETE /plot-beats/{plotBeatId}`
- `POST /works/{workId}/plot-beats/reorder`

### Notes

- `GET /works/{workId}/notes`
- `POST /works/{workId}/notes`
- `GET /notes/{noteId}`
- `PATCH /notes/{noteId}`
- `DELETE /notes/{noteId}`

### Relationship endpoints

To manage scene links cleanly:

- `POST /scenes/{sceneId}/characters/{characterId}`
- `DELETE /scenes/{sceneId}/characters/{characterId}`
- `POST /scenes/{sceneId}/timeline-events/{timelineEventId}`
- `DELETE /scenes/{sceneId}/timeline-events/{timelineEventId}`
- `PATCH /scenes/{sceneId}/plot-beat`

### API design principles

- Use nested routes where ownership is clear
- Use `PATCH` for partial updates
- Use explicit reorder endpoints instead of implicit ordering logic
- Return consistent envelopes for lists and single resources
- Include pagination metadata for collection endpoints
- Keep DTOs stable and versionable

### Example response shapes

Recommended patterns:

- Single resource response with the entity payload
- Collection response with items, total count, and paging metadata
- Validation errors with field-level details
- Authorization errors separated from validation failures

## 9. Recommended Libraries

### Frontend

- Next.js 15
- React 19 compatible setup
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Lucide React for icons
- `clsx` and `tailwind-merge` for class composition
- Sonner or a similar toast library

Optional later additions:

- TipTap or Lexical for rich text editing
- Dnd kit for drag-and-drop ordering
- Zustand for small local UI state

### Backend

- FastAPI
- Uvicorn
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- Passlib or pwdlib for password hashing
- Python-jose or PyJWT if using JWT
- `python-multipart` if file uploads are added later
- pytest
- httpx for integration tests
- ruff and mypy for quality gates

### Infrastructure and tooling

- SQLite for local MVP
- Alembic migrations from day one
- dotenv or pydantic-settings for config
- Pre-commit hooks for linting and formatting

## 10. Development Roadmap

### Phase 1: Foundation

- Create monorepo structure
- Set up backend project skeleton
- Set up frontend project skeleton
- Configure environment variables
- Establish database migrations
- Define core domain entities and DTO contracts

### Phase 2: Authentication and shell

- Implement register, login, logout, me
- Add protected frontend routes
- Build app shell and navigation
- Create dashboard with work list

### Phase 3: Work management

- CRUD for works
- Basic chapter creation and ordering
- Scene creation and editing
- Notes CRUD
- Character CRUD

### Phase 4: Narrative linking

- Scene to character links
- Scene to timeline event links
- Scene to plot beat assignment
- Reordering flows for chapters, scenes, events, and plot beats

### Phase 5: Writing experience

- Rich text or markdown-friendly editing
- Autosave
- Word count updates
- Focus mode
- Better empty states and navigation

### Phase 6: Quality and scale readiness

- Integration tests for API flows
- Frontend end-to-end smoke tests
- Accessibility pass
- Performance profiling
- PostgreSQL migration preparation
- Search and filtering

## 11. Migration Strategy to PostgreSQL

The design should stay portable by enforcing these rules now:

- Use SQLAlchemy models with dialect-agnostic types where possible
- Keep UUIDs as first-class identifiers
- Store enums as text values
- Avoid SQLite-specific assumptions in queries
- Use Alembic migrations instead of schema creation at runtime
- Keep repository interfaces stable so the database backend can change with minimal service-layer impact

If migration begins later, the likely work is limited to:

- Changing the database URL
- Updating some SQLAlchemy type mappings if necessary
- Running and validating migrations
- Testing transaction and concurrency behavior

## 12. Key Risks and Decisions

Main design risks:

- Scene content editing can become complex if rich-text requirements grow
- Ordering logic must remain deterministic under concurrent updates
- Auth needs to be browser-safe if cookies are used
- SQLite is fine for MVP, but not for long-term collaborative editing or high write concurrency

Important early decisions:

- Whether scene content is plain text, markdown, or rich text
- Whether auth uses JWT cookies or server sessions
- Whether ordering is zero-based or one-based
- Whether soft delete is required for all content types
- Whether work-level search is needed in MVP

## 13. Recommended MVP Scope

For the first build, keep the scope focused:

- Email/password auth
- Create and manage works
- Create chapters and scenes
- Create characters, events, plot beats, and notes
- Link scenes to characters and events
- Basic ordering
- Autosave for text fields
- Search within a work later, not immediately

If you want, I can turn this into the next artifact as either:

1. A formal architecture spec with diagrams and request/response contracts
2. A database schema document with tables, fields, and constraints
3. A step-by-step implementation roadmap split into backend first or frontend first
