# Intranet Cookbook for Trainees

A web-based intranet application (Single Page Application) developed as part of the practical training in **Dynamic Web Development** (FPAdW – FI37). The platform enables current and future trainees to register, share, and explore favorite recipes within the organization.

---

## Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Security Requirements](#security-requirements)
- [Installation Guide](#installation-guide)
- [Documentation (JSDoc)](#documentation-jsdoc)
- [License](#license)

---

## Features

- User registration and login
- Create, read, update, and delete recipes
- Each recipe includes: title, ingredients, preparation steps, and image
- Publicly share published recipes
- View recipe details
- Recipes are stored in a MariaDB database with image paths and user references
- JWT-based authentication & protected routes
- Add and delete comments on recipes
- Save recipes as favorites
- Filter/search recipes by category or title
- Assign categories to recipes
- Edit user profile (display name, email, profile picture)

---

## Technologies Used

| Layer       | Technology                                                      |
|-------------|-----------------------------------------------------------------|
| Frontend    | Vite, React, JavaScript, React Router, axios                    |
| Backend     | Node.js, Express.js, cors, dotenv, jsonwebtoken, bcrypt, mariadb|
| Database    | MariaDB                                                         |
| Auth        | JWT (JSON Web Token), bcrypt                                    |
| Tools       | Git, VS Code, Postman                                           |

---

## Project Structure

```bash
intranet-kochbuch/
├── backend/                 → Backend logic (API, routes, DB connection)
│   ├── index.js            → Main server entry point
│   ├── db/                 → Database connection and SQL dump
│   ├── routes/             → Route handlers (recipes, users, comments, contact)
│   ├── middleware/         → Authentication middleware (JWT)
│   ├── uploads/            → Uploaded recipe images
│   ├── profile_pics/       → Uploaded user profile pictures
│   ├── public/             → Fallback index.html (SPA)
│   ├── jsdoc.json          → JSDoc configuration
│   └── docs-backend/       → Auto-generated documentation (after build)
│
├── frontend/                → Frontend interface (SPA)
│   ├── index.html          → Entry HTML file
│   ├── src/                → Application source code
│   ├── public/             → Public assets
│   ├── package.json        → Frontend dependencies
│   └── vite.config.js      → Vite configuration
│
├── .gitignore
├── README.md
```

---

## Security Requirements

- Passwords are securely hashed using bcrypt
- Password policy: minimum 8 characters, one uppercase letter, one number, one special character (!@$%?)
- JWT authentication required for all protected routes
- HTTPS recommended for production environments

---

## Installation Guide

### Prerequisites

- Node.js v20+ (recommended: 22.15.1)
- MariaDB (SQL setup required)
- Git (for version control)

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file in the `backend/` directory with the following content:

```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=fi37_sbeih_fpadw
JWT_KEY=your_jwt_secret
MAIL_ADMIN=your-admin-email@gmail.com
MAIL_PASS=your-app-password
MAIL_USER=your-app-email@gmail.com
```

Import the file `db/fi37_sbeih_fpadw.sql` into your MariaDB server.

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in the `frontend/` directory with the following content:

```
VITE_BACKEND_URL=http://backend-api.com:3001
VITE_FRONTEND_HOST=frontend.com
VITE_FRONTEND_PORT=3000
```

The frontend will be served based on the values from the `.env` file:

- **Frontend Host:** `http://frontend.com:3000`
- **Backend API:** `http://backend-api.com:3001`

If you want to test locally, you can change the values to:

```
VITE_BACKEND_URL=http://localhost:3001
VITE_FRONTEND_HOST=localhost
VITE_FRONTEND_PORT=5173
```

**Note**: The frontend proxy (`/api`) will forward requests to the backend based on `VITE_BACKEND_URL`.

Make sure to run both frontend and backend in **parallel** during development.

---

## .env.example files

To support easier deployment and onboarding, both backend and frontend include example `.env.example` files with placeholder values:

- `frontend/.env.example`
- `backend/.env.example`

Always copy these into `.env` and adjust values to match your environment.

---

## Documentation (JSDoc)

All backend code is fully documented using **JSDoc**.

To generate the documentation:

```bash
cd backend
npm install
npm run docs
```

This will create an HTML documentation site under:

```
backend/docs-backend/index.html
```

You can open this file in your browser for full reference of all API routes, middleware, controllers, and configurations.

---

## License

This project is part of the **Umschulung for Fachinformatiker/in – Application Development** by **Sbeih Ihab, Berlin**.  
All content is provided for educational and non-commercial use only.
