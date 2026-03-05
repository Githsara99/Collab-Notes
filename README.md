# CollabNotes 📝

A collaborative note-taking web application built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## Features

- 🔐 **JWT Authentication** — Register, login, and secure session management
- 📝 **Rich Text Editor** — Full formatting toolbar (bold, italic, headings, lists, code blocks, task lists, quotes, highlights)
- 🔍 **Full-Text Search** — MongoDB text indexes for fast note search with debounced input
- 👥 **Collaborator Management** — Add collaborators by email with `read` or `write` permissions; remove anytime
- 🏷️ **Tags & Filters** — Tag notes, filter by tag, pin, or archive
- 🎨 **Note Colors** — Color-code notes for visual organization
- 📌 **Pin & Archive** — Pin important notes to the top; archive old ones
- 📄 **Pagination** — Cursor-based "load more" pagination via mongoose-paginate-v2
- 🛡️ **Rate Limiting** — 100 requests per 15 minutes per IP

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6, Tailwind CSS |
| Editor    | Tiptap v2 (ProseMirror-based)       |
| Backend   | Node.js, Express 4                  |
| Database  | MongoDB with Mongoose               |
| Auth      | JWT (jsonwebtoken) + bcryptjs       |
| HTTP      | Axios                               |

## Project Structure

```
collabnotes/
├── backend/
│   ├── controllers/
│   │   ├── authController.js     # Register, login, me
│   │   └── noteController.js     # CRUD + collaborator management
│   ├── middleware/
│   │   └── auth.js               # JWT protect middleware
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hashing
│   │   └── Note.js               # Note schema with pagination plugin
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   └── users.js
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── editor/
        │   │   └── RichEditor.js  # Tiptap rich text editor
        │   └── notes/
        │       ├── NoteCard.js    # Note grid card
        │       └── NoteModal.js   # Create/edit modal with collab tab
        ├── context/
        │   └── AuthContext.js     # Auth state & API calls
        ├── pages/
        │   ├── AuthPage.js        # Login / Register
        │   └── Dashboard.js       # Main notes view
        ├── utils/
        │   └── api.js             # Axios instance with interceptors
        ├── App.js
        └── index.js
```

## Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd collabnotes
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabnotes
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

> **Note:** If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` (optional — proxy is already configured in package.json):

```bash
# Only needed if backend is not on port 5000
# REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

The app will open at `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable     | Description                          | Example                              |
|--------------|--------------------------------------|--------------------------------------|
| `PORT`       | Express server port                  | `5000`                               |
| `MONGO_URI`  | MongoDB connection string            | `mongodb://localhost:27017/collabnotes` |
| `JWT_SECRET` | Secret key for signing JWTs          | `supersecretkey123abc`               |
| `JWT_EXPIRE` | JWT expiry duration                  | `7d`                                 |
| `NODE_ENV`   | Environment mode                     | `development` or `production`        |
| `CLIENT_URL` | Frontend URL for CORS                | `http://localhost:3000`              |

---

## API Endpoints

### Auth
| Method | Endpoint            | Description       | Auth |
|--------|---------------------|-------------------|------|
| POST   | `/api/auth/register` | Create account    | ❌   |
| POST   | `/api/auth/login`    | Login             | ❌   |
| GET    | `/api/auth/me`       | Get current user  | ✅   |

### Notes
| Method | Endpoint                              | Description                  | Auth |
|--------|---------------------------------------|------------------------------|------|
| GET    | `/api/notes`                          | List notes (search, paginate)| ✅   |
| POST   | `/api/notes`                          | Create note                  | ✅   |
| GET    | `/api/notes/:id`                      | Get single note              | ✅   |
| PUT    | `/api/notes/:id`                      | Update note                  | ✅   |
| DELETE | `/api/notes/:id`                      | Delete note (owner only)     | ✅   |
| POST   | `/api/notes/:id/collaborators`        | Add collaborator             | ✅   |
| DELETE | `/api/notes/:id/collaborators/:uid`   | Remove collaborator          | ✅   |

### Users
| Method | Endpoint         | Description          | Auth |
|--------|------------------|----------------------|------|
| GET    | `/api/users/search` | Search users by email | ✅  |
| PUT    | `/api/users/me`  | Update profile       | ✅   |

---

## Assumptions Made

1. **No real-time collaboration** — Multiple users can edit the same note but changes are saved on a per-session basis; real-time sync (e.g., via WebSockets) was not included as it was not specified.
2. **Soft delete not implemented** — The spec mentioned soft deletes in Track A. For Track C, full delete is used as it was not explicitly required.
3. **Email uniqueness** — Email addresses are used to identify collaborators. Users must be registered before they can be added.
4. **No email notifications** — Adding collaborators does not send emails (no SMTP configured).
5. **Avatar** — User avatars default to initials rendered in UI. No file upload is implemented.

---

## Demo Video

[Include your Loom / screen recording link here]

---

## License

MIT
