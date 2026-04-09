# Overview of Backend APIs and Frontend Usage

## Table of Contents
- [Authentication API](#authentication-api)
- [Story API](#story-api)
- [Action API](#action-api)
- [Message API](#message-api)
- [Character API](#character-api)
- [User API](#user-api)
- [Health API](#health-api)

---

## Authentication API
| Method | Endpoint | Description | Frontend Caller | UI Location |
|--------|----------|-------------|----------------|------------|
| **POST** | `/api/auth/register` | Register a new user (username, email, password). Returns a success message or error. | `frontend/src/pages/Register.jsx` (axios POST) | Registration form submit button |
| **POST** | `/api/auth/login` | Login with identifier (username/email) and password. Returns JWT token. | `frontend/src/pages/Login.jsx` (axios POST) | Login form submit button |

---

## Story API
| Method | Endpoint | Description | Frontend Caller | UI Location |
|--------|----------|-------------|----------------|------------|
| **GET** | `/api/story` | Retrieve list of stories accessible to the user. | `frontend/src/pages/Dashboard.jsx` (axios GET) | Dashboard story list view |
| **POST** | `/api/story` | Create a new story (title, description). Returns created story object. | `frontend/src/pages/Dashboard.jsx` (axios POST) | Dashboard "Create Story" button |
| **GET** | `/api/story/:id` | Get detailed information for a specific story. | `frontend/src/pages/StoryConsole.jsx` (axios GET) | Story console header/details |
| **GET** | `/api/story/:storyID/characters` | List characters belonging to a story. | `frontend/src/pages/StoryConsole.jsx` (axios GET) | Characters panel in story console |
| **GET** | `/api/story/:storyID/characters/me` | Get the logged‑in user's character for the story. | `frontend/src/pages/StoryConsole.jsx` (axios GET) | "My Character" section |
| **POST** | `/api/story/:storyID/characters` | Create a new character for the story. | `frontend/src/pages/StoryConsole.jsx` (axios POST) | Character creation modal |
| **PUT** | `/api/story/:storyID/characters/:characterId` | Update character details. | `frontend/src/pages/StoryConsole.jsx` (axios PUT) | Character edit form |
| **GET** | `/api/story/:id/requests` | Fetch global action requests for the story. | `frontend/src/pages/StoryConsole.jsx` (axios GET) | Global requests list |
| **GET** | `/api/story/:id/actions` | Retrieve actions for the story. | `frontend/src/pages/StoryConsole.jsx` (axios GET) | Actions list panel |
| **POST** | `/api/story/:id/actions` | Create a new action. | `frontend/src/pages/StoryConsole.jsx` (axios POST) | Action creation UI |
| **POST** | `/api/story/:id/actions/:actionId/request-global` | Request to make an action global. | `frontend/src/pages/StoryConsole.jsx` (axios POST) | "Make Global" button on an action |
| **PUT** | `/api/story/:id/requests/:requestId` | Resolve a global request (approve/deny). | `frontend/src/pages/StoryConsole.jsx` (axios PUT) | Request approval modal |
| **DELETE** | `/api/story/:id/actions/:actionId` | Delete an action. | `frontend/src/pages/StoryConsole.jsx` (axios DELETE) | Delete action icon |
| **PUT** | `/api/story/:id/actions/:actionId/scenario` | Toggle action scenario between GLOBAL / LOCAL. | `frontend/src/pages/StoryConsole.jsx` (axios PUT) | Scenario toggle switch |

---

## Action API (Standalone routes under `/api/actions`)
| Method | Endpoint | Description | Frontend Caller | UI Location |
|--------|----------|-------------|----------------|------------|
| **GET** | `/api/actions` | List all actions (admin view). | *Not currently used in UI* | — |
| **POST** | `/api/actions` | Create a new action (admin). | *Not currently used in UI* | — |
| **PUT** | `/api/actions/:actionId` | Update an action. | *Not currently used in UI* | — |
| **DELETE** | `/api/actions/:actionId` | Delete an action. | *Not currently used in UI* | — |
| **POST** | `/api/actions/:actionId/request-global` | Request global status for an action. | *Not currently used in UI* | — |
| **GET** | `/api/requests` | List all global requests. | *Not currently used in UI* | — |
| **PUT** | `/api/requests/:requestId` | Resolve a request. | *Not currently used in UI* | — |
| **PUT** | `/api/actions/:actionId/scenario` | Toggle scenario (global/local). | *Not currently used in UI* | — |

---

## Message API
| Method | Endpoint | Description | Frontend Caller | UI Location |
|--------|----------|-------------|----------------|------------|
| **GET** | `/api/messages/:storyId` | Retrieve chat history for a story. | `frontend/src/pages/StoryConsole.jsx` (axios GET) | Chat pane in story console |

---

## Character API
| Method | Endpoint | Description | Frontend Caller | UI Location |
|--------|----------|-------------|----------------|------------|
| **GET** | `/api/character` | Get all characters (admin). | *Not used in UI* | — |
| **POST** | `/api/character` | Create a character (admin). | *Not used in UI* | — |
| **GET** | `/api/character/me` | Get the logged‑in user's character. | *Used via `/api/users/me/characters`* (see User API) | — |
| **PUT** | `/api/character/:characterId` | Update a character. | *Not used in UI* | — |

---

## User API
| Method | Endpoint | Description | Frontend Caller | UI Location |
|--------|----------|-------------|----------------|------------|
| **GET** | `/api/users` | List all users (admin). | *Not used in UI* | — |
| **POST** | `/api/users` | Create a new user (admin). | *Not used in UI* | — |
| **GET** | `/api/users/me` | Get current user profile. | *Used indirectly for auth context* | — |
| **GET** | `/api/users/me/characters` | Get characters belonging to the current user. | `frontend/src/pages/Dashboard.jsx` (axios GET) | Dashboard character list |

---

## Health API
| Method | Endpoint | Description | Frontend Caller | UI Location |
|--------|----------|-------------|----------------|------------|
| **GET** | `/api/` | Simple health check returning status. | *Not called by UI* | — |

---

### How to Use This Document
- Each row shows the HTTP method, the full path (prefixed with `/api`), a brief purpose, the frontend file that makes the request, and where the response is rendered.
- When designing UI components in Google Stitch, reference the **UI Location** column to understand which part of the app consumes the data.
- If new frontend pages are added, extend this table with the corresponding endpoint and UI mapping.

*Generated on 2026‑03‑24.*
