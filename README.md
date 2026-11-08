# Project Camp Backend

![Node.js](https://img.shields.io/badge/Node.js-v18+-22c55e?style=flat-square&logo=node.js&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-eab308?style=flat-square)
![Security](https://img.shields.io/badge/RBAC-3--Tier-ec4899?style=flat-square)
![Architecture](https://img.shields.io/badge/API-RESTful-f97316?style=flat-square)

> Production-ready RESTful API powering collaborative project workspaces, task tracking, and synchronous documentation with fine-grained access control.

---

### Key Capabilities

* **Layered RBAC:** Strict 3-tier hierarchy (`Admin`, `Project Admin`, `Member`) controlling workspace, task, and note scopes.
* **Session Security:** Token rotation cycle (JWT access & refresh tokens), email verification, and secure password recovery.
* **Workspace Isolation:** Insulated project spaces with granular member roster management.
* **Hierarchical Tasks:** Top-level workflow cards (`todo`, `in_progress`, `done`) containing discrete, actionable subtask nodes.
* **Workboards & Files:** Dedicated team markdown notes for centralized project knowledge and multi-file metadata tracking.

---

### Access Matrix

| Feature | System Admin | Project Admin | Team Member |
| :--- | :---: | :---: | :---: |
| **Manage Workspaces & Members** | Full | — | — |
| **Project Notes (Create / Edit)** | Full | — | Read Only |
| **Tasks & Subtasks (Structure)** | Full | Full | — |
| **Task Status & Subtask Checkoffs** | Full | Full | Assigned Only |
| **Shared Knowledge Board** | Full | Read Only | Read Only |

---

### API Architecture

Base URL: `/api/v1`

#### `POST /auth`
* `/register` — Create account and trigger verification
* `/login` & `/logout` — Session generation and invalidation
* `/refresh-token` — Rotate active access token
* `/verify-email/:verificationToken` — Token verification
* `/forgot-password` & `/reset-password/:resetToken` — Recovery cycle

#### `CRUD /projects`
* `GET, POST /` — List user workspaces / create new workspace
* `GET, PUT, DELETE /:projectId` — Manage target workspace scope
* `GET, POST, PUT, DELETE /:projectId/members` — Manage project collaborators

#### `CRUD /tasks`
* `GET, POST /:projectId` — Workspace tasks overview and ticket creation
* `GET, PUT, DELETE /:projectId/t/:taskId` — Manage task metadata and state
* `POST, PUT, DELETE /:projectId/st/:subTaskId` — Nested checklist nodes

#### `CRUD /notes`
* `GET, POST /:projectId` — Workspace documentation feed / append note
* `GET, PUT, DELETE /:projectId/n/:noteId` — Knowledge base updates

#### `GET /healthcheck`
* System uptime, microservice checks, and runtime status

---

### Installation & Local Setup

#### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or later)
* [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas URI)
* [Git](https://git-scm.com/)

#### 1. Clone the repository
```bash
git clone git@github.com:siddw09/project-camp.git
cd project-camp
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

Create a `.env` file in the project root from the example file. You can either
copy the file:

```bash
cp .env.example .env
```

or rename it:

```bash
mv .env.example .env
```

Open `.env`, add your database, JWT, and mail service credentials, and update
any other values for your local environment:

```dotenv
# Server
PORT=8000
CORS_ORIGIN=http://localhost:5173

# Database
MONGO_URL=mongodb://localhost:27017/project-camp

# JWT authentication
ACCESS_TOKEN_SECRET=replace-with-a-long-random-access-token-secret
ACCESS_TOKEN_EXPIRY=1D
REFRESH_TOKEN_SECRET=replace-with-a-long-random-refresh-token-secret
REFRESH_TOKEN_EXPIRY=10D

# Mail transport (Mailtrap SMTP)
MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=your-mailtrap-username
MAILTRAP_SMTP_PASS=your-mailtrap-password

# Password reset and file URL configuration
FORGOT_PASSWORD_REDIRECT_URL=http://localhost:3000/forgot-password
SERVER_URL=http://localhost:8000
```

> **Note:** If you use Gmail or another SMTP provider instead of Mailtrap,
> replace the `MAILTRAP_SMTP_*` values with the credentials and host details
> required by your provider. Never commit your `.env` file or real secrets.

#### 4. Run the application

Start the development server with hot reload:

```bash
npm run dev
```

To start the application without hot reload:

```bash
npm start
```

Verify your setup by requesting the healthcheck endpoint:

```bash
curl http://localhost:8000/api/v1/healthCheck
```