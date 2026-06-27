# Campus360 Backend API

Smart campus management platform backend.

## Tech Stack

- **Runtime:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (bcryptjs)
- **File Storage:** Cloudinary
- **AI:** Google Gemini API

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GEMINI_API_KEY` | Google Gemini API key |

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`.

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get profile |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Private | Stats, recent notices, upcoming events |

### Notices (Admin CRUD)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notices` | Private | List notices (search, category, pagination) |
| GET | `/api/notices/:id` | Private | Get notice |
| POST | `/api/notices` | Admin | Create notice |
| PUT | `/api/notices/:id` | Admin | Update notice |
| DELETE | `/api/notices/:id` | Admin | Delete notice |

### Events (Admin CRUD)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | Private | List events (search, category, pagination) |
| GET | `/api/events/:id` | Private | Get event |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Delete event |

### Complaints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/complaints` | Private | List complaints (student sees own, admin sees all) |
| GET | `/api/complaints/:id` | Private | Get complaint |
| POST | `/api/complaints` | Private | Create complaint |
| PUT | `/api/complaints/:id/status` | Admin | Update status |
| DELETE | `/api/complaints/:id` | Admin | Delete complaint |

### Lost & Found

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/lostfound` | Private | List items (search, category, type) |
| POST | `/api/lostfound` | Private | Report item (with image upload) |
| PUT | `/api/lostfound/:id/status` | Private | Update status |

### Gallery (Admin upload)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/gallery` | Private | List gallery images |
| POST | `/api/gallery` | Admin | Upload image |
| DELETE | `/api/gallery/:id` | Admin | Delete image |

### AI (Gemini)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/summarize` | Admin | Summarize notice text |
| POST | `/api/ai/event-assistant` | Private | Ask questions about events |

---

## Auth

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Multi-College

Every collection supports `college_id`. Users only see data from their college.
