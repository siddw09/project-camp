#  Project Camp Backend

Project Camp Backend is a robust, RESTful API service designed to power collaborative project management systems. It provides full-featured project workspaces, task tracking with subtasks, secure document attachments, project notes, and an advanced, granular three-tier Role-Based Access Control (RBAC) security matrix.

---

##  Table of Contents
- [Core Features](#-core-features)
- [System Architecture & Permissions](#-system-architecture--permissions)
- [API Endpoints Reference](#-api-endpoints-reference)
  - [Authentication (`/auth`)](#1-authentication-routes-apiv1auth)
  - [Projects (`/projects`)](#2-project-routes-apiv1projects)
  - [Tasks (`/tasks`)](#3-task-routes-apiv1tasks)
  - [Notes (`/notes`)](#4-note-routes-apiv1notes)
  - [Healthcheck (`/healthcheck`)](#5-system-health-check-apiv1healthcheck)
- [Security & File Management](#-security--file-management)
- [Getting Started](#-getting-started)

---

##  Core Features

* **🔒 Secure Authentication:** JWT tokens with an access/refresh token rotation cycle, dynamic email verification, and recovery workflows.
* **📂 Workspace Management:** Create separate, insulated collaborative project environments.
* **👥 Team Collaboration:** Add teammates directly to projects via email invitations and assign tailored workspace permissions.
* **📋 Nested Task Tracking:** Organize work hierarchically using top-level tasks with status tracking (`todo`, `in_progress`, `done`) alongside discrete, actionable subtasks.
* **📎 Asset Attachments:** Multi-file metadata tracking on tasks for unified resource access.
* **📝 Project Workboards:** Knowledge base creation through dedicated project notes for synchronous team documentation.

---

## 🛡️ System Architecture & Permissions

The system operates with a rigid **Three-Tier Access Control Layer** (`admin`, `project_admin`, and `member`). Ensure your authorization headers provide correct tokens matching these scopes:

| Workspace Feature | System Admin | Project Admin | Team Member |
| :--- | :---: | :---: | :---: |
| **Create Projects** | ✔️ | ❌ | ❌ |
| **Update / Delete Project Structural Details** | ✔️ | ❌ | ❌ |
| **Manage Project Workspace Members** | ✔️ | ❌ | ❌ |
| **Create / Update / Delete Core Tasks** | ✔️ | ✔️ | ❌ |
| **View Project Tasks** | ✔️ | ✔️ | ✔️ |
| **Complete Subtasks** | ✔️ | ✔️ | ✔️ |
| **Create / Delete Subtask Nodes** | ✔️ | ✔️ | ❌ |
| **Create / Update / Delete Board Notes** | ✔️ | ❌ | ❌ |
| **View Shared Notes** | ✔️ | ✔️ | ✔️ |

---

## 🗺️ API Endpoints Reference

All base requests must point to the root path: `/api/v1`

### 1. Authentication Routes (`/api/v1/auth/`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Registers user profile; fires verification email token. |
| `POST` | `/login` | Public | Validates user payload; issues short-lived JWT & refresh token. |
| `POST` | `/logout` | Secured 🔑 | Invalidates access active status and clears user session safely. |
| `GET` | `/current-user` | Secured 🔑 | Returns detailed context payload of the current logged-in user. |
| `POST` | `/change-password` | Secured 🔑 | Overwrites current credential password with a newly supplied token. |
| `POST` | `/refresh-token` | Public | Validates expiration; rotates active access tokens automatically. |
| `GET` | `/verify-email/:verificationToken` | Public | Consumes validation query parameters to verify email account. |
| `POST` | `/forgot-password` | Public | Registers reset intent; emails token link to secure target destination. |
| `POST` | `/reset-password/:resetToken` | Public | Updates user password with new credentials. |
| `POST` | `/resend-email-verification` | Secured 🔑 | Regenerates and fires a new verification token to the user inbox. |

### 2. Project Routes (`/api/v1/projects/`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Secured 🔑 | Fetches collections of all workspaces current user has access to. |
| `POST` | `/` | Secured 🔑 | Instantiates a new workspace with custom metrics data. |
| `GET` | `/:projectId` | Secured (RBAC) | Resolves structural breakdown details of the target workspace scope. |
| `PUT` | `/:projectId` | Secured (Admin Only) | Updates specific metadata structures (Title, Details). |
| `DELETE` | `/:projectId` | Secured (Admin Only) | Performs hard deletion of the project context space entirely. |
| `GET` | `/:projectId/members` | Secured 🔑 | Returns structural roster list of current workspace participants. |
| `POST` | `/:projectId/members` | Secured (Admin Only)| Hooks a new member invitation profile into the workspace. |
| `PUT` | `/:projectId/members/:userId` | Secured (Admin Only)| Updates permissions layer level (`member` ↔ `project_admin`). |
| `DELETE` | `/:projectId/members/:userId` | Secured (Admin Only)| Removes target individual's workspace authorization entirely. |

### 3. Task Routes (`/api/v1/tasks/`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/:projectId` | Secured (RBAC) | Lists all high-level task cards in the project workspace. |
| `POST` | `/:projectId` | Secured (Admin / PA) | Generates a tracking ticket, sets parameters, and maps assignments. |
| `GET` | `/:projectId/t/:taskId` | Secured (RBAC) | Returns fully populated data for a specific task card. |
| `PUT` | `/:projectId/t/:taskId` | Secured (Admin / PA) | Updates properties, file attachment arrays, or workflow state. |
| `DELETE` | `/:projectId/t/:taskId` | Secured (Admin / PA) | Drops target tracking card and sweeps nested associations. |
| `POST` | `/:projectId/t/:taskId/subtasks` | Secured (Admin / PA) | Appends actionable child checkpoints directly into parent tracking. |
| `PUT` | `/:projectId/st/:subTaskId` | Secured (RBAC) | Updates status (`todo`, `in_progress`, `done`) or text labels. |
| `DELETE` | `/:projectId/st/:subTaskId` | Secured (Admin / PA) | Drops nested check item row elements from the tracking tree. |

### 4. Note Routes (`/api/v1/notes/`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/:projectId` | Secured (RBAC) | Exposes documentation files attached to a workspace. |
| `POST` | `/:projectId` | Secured (Admin Only) | Compiles and binds a permanent note resource asset. |
| `GET` | `/:projectId/n/:noteId` | Secured (RBAC) | Resolves target markdown string raw contents body info safely. |
| `PUT` | `/:projectId/n/:noteId` | Secured (Admin Only) | Modifies text payloads inside existing knowledge documents. |
| `DELETE` | `/:projectId/n/:noteId` | Secured (Admin Only) | Evicts targeted documentation context blocks instantly. |

### 5. System Health Check (`/api/v1/healthcheck/`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Returns system uptime, diagnostics status indicators, and microservice checks. |

---

## 🛠️ Security & File Management


