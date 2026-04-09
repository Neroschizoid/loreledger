# Lore Ledger

## Description
Lore Ledger is a collaborative storytelling platform that allows authors and players to create, manage, and interact with stories, characters, and actions in real time. It features a dynamic console where participants can chat, post actions, request global visibility for actions, and manage character traits.
something
## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Frontend**: React (Vite), JavaScript, Lucide React icons, Socket.io client
- **Real‑time**: Socket.io for live chat and action updates
- **Authentication**: JWT (handled in `auth_routes.js`)

## Key Features
- Real‑time global chat and isolated character actions
- Author controls: moderation queue, character roster management, trait editing
- Players can create personal characters and request actions to become global
- Action scenario toggling (GLOBAL ↔ LOCAL) with visual cues
- Modal dialogs for character details, persona creation, and trait management
- RESTful API for stories, characters, actions, messages, and requests

## Getting Started
### Prerequisites
- Node.js (v20 or later)
- npm (comes with Node)
- MongoDB instance (local or remote)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd loreledger

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application
1. **Start MongoDB** (ensure the `MONGODB_URI` env variable is set in `Backend/.env`).
2. **Backend**:
   ```bash
   cd Backend
   npm run dev   # or `node server.js` depending on scripts
   ```
   The API will be available at `http://localhost:5000/api`.
3. **Frontend**:
   ```bash
   cd ../frontend
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## API Overview
- `GET /api/story/:id` – Retrieve story details
- `GET /api/story/:id/characters` – List all characters in a story
- `POST /api/story/:id/characters` – Create a new character (author only)
- `GET /api/story/:id/actions` – List actions (filtered by scenario)
- `POST /api/story/:id/actions` – Submit a new action
- `PUT /api/story/:id/actions/:actionId/scenario` – Toggle GLOBAL/LOCAL
- `POST /api/story/:id/actions/:actionId/request-global` – Request global status
- `GET /api/messages/:storyId` – Fetch chat messages
- `POST /api/messages/:storyId` – Send a chat message
- Additional routes for authentication, user management, and moderation queue are defined in `Backend/routes/`.

## Contributing
Feel free to open issues or submit pull requests. Follow the existing code style and ensure all tests pass:
```bash
cd Backend
npm test
```

## License
This project is open source and available under the MIT License.

