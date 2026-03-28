# FOCUSYNC

FOCUSYNC is a full-stack productivity and focus management web application designed to help users build consistent focus habits through goal-based themes, task planning, session tracking, and productivity analytics.

## Users can

- Choose a focus goal (studies, work, fitness, etc.)
- Run deep focus timer sessions
- Manage tasks and subtasks
- Track productivity analytics and streaks
- View goal-relevant current affairs updates
- Customize themes and UI experience

The system uses a React frontend and Express backend, with JWT authentication and file-based persistence for development.

---

## Core Features

### Authentication & User Accounts

- Signup and login using JWT authentication
- Password hashing using bcrypt
- User profile retrieval and theme persistence
- Account deletion

### Goal-Based Focus System

Users choose a primary goal:

- Studies
- Work
- Workout
- Personal Development
- Custom goals

Each goal automatically adjusts:

- UI color palette
- Focus suggestions
- Relevant news updates

### Focus Timer

Deep work sessions with:

- Custom timer durations
- Focus score tracking
- Distraction tracking
- Session notes

Sessions are stored and analyzed for productivity insights.

### Task Management

Users can:

- Create tasks
- Set priority levels
- Add due dates
- Create subtasks
- Mark tasks complete

All task data is stored per user.

### Analytics Dashboard

Users receive productivity insights including:

- Focus time statistics
- Weekly productivity charts
- Goal distribution
- Task completion metrics
- Streak tracking

Charts are built using Recharts.

### Productivity Heatmap

Visual heatmap displaying:

- Daily focus activity
- Session intensity
- Weekly productivity patterns

### Current Affairs Feed

Users receive curated updates related to their selected focus goal.

Example categories:

- Tech / Work productivity
- Study tips
- Fitness news

Updates are generated from:

- curated JSON content
- optional GNews API integration

### Theme Customization

Theme system allows:

- Goal-based color palettes
- Dark mode
- Custom accent color picker

Theme preferences are stored per user.

---

## Architecture

| Layer        | Description                    |
| ------------ | ------------------------------ |
| Frontend     | React SPA with client routing  |
| Backend      | Express REST API               |
| Authentication | JWT tokens                   |
| Data Storage | JSON file-based database       |
| Optional Database | MongoDB (prepared but not enabled) |
| Deployment   | Render                         |

---

## Technology Stack

### Frontend

- React 19
- React Router 7
- Axios
- Tailwind CSS
- Framer Motion
- Recharts
- CRACO (CRA configuration override)
- PostCSS + Autoprefixer

### Backend

- Node.js
- Express 5
- JSON Web Token
- bcryptjs
- CORS
- dotenv

### Optional / Future Database

- MongoDB
- Mongoose

A Mongoose schema exists but is currently not connected in `server.js`.

---

## Project Structure

```
focusync/
│
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── focus.js
│   │   └── updates.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── db/
│   │   ├── mockDB.js
│   │   ├── tasksDB.js
│   │   ├── focusSessionsDB.js
│   │   └── updatesDB.js
│   │
│   ├── services/
│   │   └── newsService.js
│   │
│   ├── data/
│   │   └── *.json
│   │
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── utils/
│   │   └── stubs/
│   │
│   └── public/
│
└── README.md
```

---

## API Endpoints

### Auth

| Method | Endpoint |
| ------ | -------- |
| `POST` | `/api/auth/signup` |
| `POST` | `/api/auth/login` |
| `GET` | `/api/auth/me` |
| `GET` | `/api/auth/theme` |
| `DELETE` | `/api/auth/account` |

### Focus Sessions

| Method | Endpoint |
| ------ | -------- |
| `POST` | `/api/focus` |
| `GET` | `/api/focus/dashboard` |
| `GET` | `/api/focus/analytics/summary` |
| `GET` | `/api/focus/heatmap` |

### Tasks

| Method | Endpoint |
| ------ | -------- |
| `GET` | `/api/tasks` |
| `POST` | `/api/tasks` |
| `PUT` | `/api/tasks/:id` |
| `DELETE` | `/api/tasks/:id` |

### Updates

| Method | Endpoint |
| ------ | -------- |
| `GET` | `/api/updates` |
| `POST` | `/api/updates/preference` |

---

## Running Locally

### 1. Clone repository

```bash
git clone https://github.com/yourusername/focusync.git
```

### 2. Start backend

```bash
cd backend
npm install
npm start
```

Backend runs on: **http://localhost:5000**

### 3. Start frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

---

## Environment Variables

### Backend (`.env`)

```env
PORT=5000
JWT_SECRET=your_secret
GNEWS_API_KEY=optional
```

### Frontend (`.env`)

```env
REACT_APP_API_URL=http://localhost:5000
```

For local development you can omit `REACT_APP_API_URL` and rely on the Create React App proxy to `http://localhost:5000` (see `frontend/package.json`).

---

## Deployment

FOCUSYNC is deployed on Render.

| Service  | Platform           | URL |
| -------- | ------------------ | --- |
| Backend  | Render Web Service | [https://focusync.onrender.com](https://focusync.onrender.com) |
| Frontend | Render Static Site | [https://focusync-1.onrender.com](https://focusync-1.onrender.com) |

On the **frontend** Render Static Site, set:

```env
REACT_APP_API_URL=https://focusync.onrender.com
```

(No trailing slash.) This matches the fallback in `frontend/src/utils/api.js` if the variable is omitted. Rebuild/redeploy the frontend after changing env vars.

---

## Future Improvements

- MongoDB database integration
- AI productivity recommendations
- Cross-device sync
- Mobile application
- Wearable productivity tracking
- Collaborative focus sessions

---

## Author

Developed as a full-stack productivity platform demonstrating modern web development practices including:

- SPA architecture
- REST APIs
- authentication systems
- analytics dashboards
- modular component design
