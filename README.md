# Game Night — Polls & Games for Friends & Family

Game Night is a responsive multi-page app where friends and family can create polls, play games, and have fun together.
It is designed to satisfy a CS final capstone rubric with routing, API data, state management, CRUD operations, and persistent local storage.

## Core Features

- 6+ routes with React Router, including dynamic routes and 404 page
- Games page with poll creation and voting system
- Friends list with status management
- Search and filter games and friends
- External API fetch (`JSONPlaceholder`) with loading + error states
- Planner page with local CRUD (add, toggle, delete tasks)
- Notifications for game outcomes
- Mock auth/profile page with persistent sign-in state
- Local storage persistence for all games, polls, and votes
- Responsive mobile/desktop design with WhatsApp-inspired styling

## Routes

- `/` Dashboard with stats
- `/games` Browse and create polls
- `/games/:gameId` Individual game details (optional expansion)
- `/friends` Manage friends list
- `/discover` Community/API feed
- `/planner` Task planner with CRUD
- `/profile` Profile + mock auth
- `*` 404 fallback

## Stack

- React 19 (functional components + hooks)
- React Router 7 (`react-router-dom`)
- Context + reducer for shared state
- Custom hook: `useLocalStorage`
- Vite 8 + ESLint

## Local Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Quality Checks

```bash
npm run lint
npm run build
```

## Features to Explore

- **Create Polls**: Set up custom polls with multiple options
- **Vote**: Click on options to vote on active polls
- **Manage Friends**: Add friends and track their online status
- **Local Persistence**: All data is saved in browser storage
- **Responsive Design**: Works great on mobile and desktop

## Deployment

Use Vercel or Netlify with:

- Build command: `npm run build`
- Publish directory: `dist`

## Suggested Next Upgrades

- Real-time backend (Socket.io/Firebase/Supabase Realtime)
- Real authentication
- Push notifications and richer message status
- PWA offline mode
