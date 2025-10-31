# S-Book: A Feature-Rich Social Media Backend

### A production-ready REST API for a modern social media platform, built with Node.js, Express, and MongoDB. This project showcases a robust, scalable, and secure backend architecture, perfect for demonstrating core backend engineering skills.

##### It includes authentication, posts, comments, reactions, friends, stories, notifications, blocking, and admin workflows — with robust validation, error handling, logging, and performance-conscious indexing.

> **Note for Recruiters:** This project was built to demonstrate a comprehensive understanding of modern backend development, from initial architecture and security to performance optimization and deployment readiness. It serves as a practical example of my ability to deliver a complex, feature-complete application.

---

### 🌟 Important Links

| Resource                 | URL                                                                                          |
| :----------------------- | :------------------------------------------------------------------------------------------- |
| 🚀 **Live API Base URL** | `https://s-book-social-backend.onrender.com`                                                 |
| 📚 **API Documentation** | [Postman Docs](https://documenter.getpostman.com/view/30515463/2sB3QGtB5W)                   |
| 📊 **ERD / Schema**      | [Lucidchart Diagram](https://lucid.app/lucidchart/892230fe-9d70-49c0-b26b-54e6f8246aa7/view) |

---

### ✨ Key Features

- **Authentication & Authorization:**

  - **JWT Strategy:** Secure, stateless authentication using JWT with access and refresh tokens.
  - **Email Verification:** New users receive a verification link to activate their account.
  - **Password Management:** Full password lifecycle, including change, forgot, and reset password flows.
  - **Role-Based Access Control (RBAC):** Granular permissions for `USER`, `ADMIN`, and `SUPER_ADMIN` roles protecting sensitive endpoints.

- **User & Profile Management:**

  - **Account Lifecycle:** Users can deactivate or soft-delete their accounts. A daily cron job permanently deletes accounts soft-deleted for over 30 days.
  - **Admin Controls:** Admins can suspend and restore user accounts.
  - **Customizable Profiles:** Users can update their profile information, including profile and cover photos.
  - **Profile Viewing:** View other user profiles, with checks to prevent viewing if a mutual block is in place.

- **Social Graph & Interactions:**

  - **Friend System:** Full friend request lifecycle (send, accept, reject, undo) with status tracking.
  - **User Blocking:** A mutual blocking system prevents any interaction (viewing profiles, posts, etc.) between two users.
  - **@Mentions:** Users can mention friends in posts and comments, triggering notifications. A dedicated endpoint provides a searchable list of mentionable friends.

- **Content Creation & Feeds:**

  - **Posts:** Create rich posts with text, multiple images, user tags, and @mentions.
  - **Audience Control:** Set post visibility to `PUBLIC`, `FRIENDS`, or `PRIVATE`.
  - **Personalized Post Feed:** A sophisticated feed endpoint aggregates posts from the user, their friends, and followed users, respecting all visibility and blocking rules.
  - **Stories:** Create 24-hour ephemeral stories with images, text, and @mentions, with `PUBLIC`, `FRIENDS`, and `PRIVATE` visibility.
  - **Story Feed:** A dedicated feed for stories, intelligently sorted to show the user's own stories first.

- **Engagement & Notifications:**

  - **Threaded Comments:** A nested comment system allows for threaded replies on posts.
  - **Reactions:** Users can react to posts with various reaction types.
  - **Story Views & Reactions:** Track who has viewed a story and allow users to react.
  - **Event-Driven Notifications:** A real-time notification system alerts users to key events:
    - New friend requests
    - Post/comment reactions
    - Comments on posts and replies to comments
    - @mentions in posts and comments
    - Admin actions (e.g., post removal/appeal status)

- **Moderation & Administration:**
  - **Post Appeals:** When an admin removes a post, the user is notified and can submit an appeal.
  - **Appeal Management:** Admins can review, approve, or reject post appeals, notifying the user of the outcome.
  - **Broadcast Notifications:** Admins can send system-wide notifications to all users.
- **Personalized Feeds:**
  - `v1/posts/feed` endpoint that aggregates posts from friends and followed users based on visibility rules.
  - `v1/stories/feed` that intelligently sorts and displays stories.
- **Background Jobs:**
  - A cron job that runs daily to permanently delete user accounts that were soft-deleted over 30 days ago.

---

### API highlights

- **Auth**: registration, email verification, login, refresh, password change/reset
- **Users**: get all (admin), get by id (admin), update username, deactivate/soft-delete/reactivate, suspend/restore, find mentionable friends
- **Profiles**: get/update own, get by userId (with block validation)
- **Posts**: CRUD, feed, get by id, get another user’s posts (visibility-aware), admin remove/restore/reject appeal
- **Comments**: create/reply, list top-level by post, list replies, update, delete (recursive)
- **Reactions**: toggle on target, list, counts
- **Friends**: requests (send/accept/reject/undo), lists (sent/received/friends), delete by userId
- **Stories**: create, views, reactions, user active stories, feed, by id, delete
- **Notifications**: list, read one/read-all, unread count, broadcast (admin)

---

### 🛠️ Technology Stack

| Category           | Technology                       |
| :----------------- | :------------------------------- |
| **Backend**        | Node.js, Express.js, TypeScript  |
| **Database**       | MongoDB with Mongoose            |
| **Authentication** | JSON Web Tokens (JWT)            |
| **Validation**     | Zod                              |
| **File Uploads**   | Multer, Cloudinary               |
| **Email**          | Nodemailer, Sendgrid, Handlebars |
| **Scheduling**     | `node-cron`                      |
| **Tooling**        | ESLint, Prettier, pnpm           |

---

### 🛡️ Security & Best Practices

Security was a top priority. The API is hardened with modern best practices.

- **Password Hashing:** Using `bcrypt` to securely hash and store user passwords.
- **Data Validation:** Rigorous schema-based validation on all incoming requests (`body`, `params`, `query`) using **Zod** to prevent NoSQL injection, XSS attack, and ensure data integrity.
- **Role-Based Access Control (RBAC):** Middleware protects routes based on user roles (e.g., only admins can access certain endpoints).
- **Rate Limiting:** Implemented to protect against brute-force and denial-of-service attacks.
- **Clean Architecture:** The project follows a modular, feature-based architecture with a clear separation of concerns (routes, controllers, services, models), promoting clean code, single responsibility, and maintainability (DRY).
- **Error Handling:** A global error handler ensures that all errors are caught and formatted into a consistent, meaningful response.
- **Logging:** A robust logging system is in place for traceability and debugging.
- **Atomic Operations:** Uses MongoDB transactions for complex multi-step workflows, guaranteeing integrity (ex: post appeal approval/restore, admin actions).
- **Pagination Everywhere:** Consistent pagination protects APIs from abuse and ensures scalable queries.

---

### 🚀 Performance & Database Optimization

The database is designed for performance and scalability.

- **Strategic Indexing:** Every model has been indexed to optimize common query patterns.
  - **Unique Indexes:** Enforce data integrity (e.g., unique usernames, emails, friend requests).
  - **Compound Indexes:** Speed up complex queries on feeds, notifications, and posts.
  - **TTL (Time-to-Live) Indexes:** Automatically purge expired data like rejected friend requests (after 7 days) and old notifications (after 30 days).

---

### 🚧 Challenges & Learnings

Every project has its challenges. Here’s how I tackled them and what I learned.

- **Challenge:** Initial system design and planning were not thorough enough, leading to extra development time and refactoring.
  - **Learning:** This experience reinforced the critical importance of upfront system design and clear data modeling. I now have a much stronger appreciation for planning before coding.
- **Challenge:** Integrating a reliable email service within deployment platform constraints.
  - **Learning:** I first encountered the limitations of SendGrid's free tier. Then, I discovered that Render (the deployment platform) blocks standard SMTP ports for Gmail. This taught me to build flexible, abstracted utility services (`sendEmail`) and the necessity of using professional email providers with custom domains in a production environment.
- **Challenge:** Designing efficient queries for feeds and social graphs in a NoSQL database.
  - **Learning:** While MongoDB offers flexibility, I learned that complex social features require careful use of aggregation pipelines, strategic indexing, and well-defined schemas to ensure performance at scale.

---

### ⚙️ Getting Started

#### Prerequisites

- Node.js (v18 or higher)
- pnpm
- A MongoDB database instance (local or cloud)

#### 1. Clone the repository

```bash
git clone https://github.com/jakirulislamhakim/s-book-social-backend
cd s-book-social-backend
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Set up environment variables

Duplicate the existing `.env.example` file and rename it to `.env`. Then configure the env variables by following the instructions.

#### 4. Run the application

```bash
# For development with live reloading
pnpm dev

# To build for production
pnpm build

# To run the production build
pnpm start
```

---

### 📂 Project Structure

```
src/
├── app/
│   ├── v1/
│   │   ├── modules/      # Feature modules (Auth, User, Post, etc.)
│   │   ├── middlewares/  # Auth, validation, rate limiting, error handling
│   │   ├── utils/        # Reusable utilities (QueryBuilder, email, etc.)
│   │   ├── jobs/         # Cron jobs for background tasks
│   │   └── routes/       # API versioning and route aggregation
│   └── server.ts       # Express server setup
└── ...
```

---

### ⚠ Known Issues & Risks

- Sending emails is currently disabled
  - Why: Free-tier/provider constraints (SMTP blocked on host)
  - Impact: Users receive verification/reset links in API responses instead of email
  - Mitigation: Enable provider-backed email (e.g., Resend/SendGrid/Postmark) with a custom domain; send email using SendGrid or Nodemailer utility function

---

### ✍️ Author

Built by **Jakirul Islam Hakim** – a passionate backend developer open to new opportunities. If this project aligns with what you're looking for, I'd be excited to connect!
