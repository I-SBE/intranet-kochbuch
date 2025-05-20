# Intranet Cookbook for Trainees

A web-based intranet application developed as part of the practical training in **Dynamic Web Development** (FPAdW – FI37). The platform enables current and future trainees to register, share, and explore favorite recipes within the organization.

---

## Features

- User registration and login
- Create, read, update, and delete recipes
- Each recipe includes: title, ingredients, preparation steps, and image
- Publicly share published recipes
- View recipe details

### Optional Features

- Add and delete comments on recipes
- Save recipes as favorites
- Filter/search recipes by category or title
- Assign categories to recipes
- Edit user profile (display name, email, profile picture)

---

## Technologies Used

| Layer       | Technology                                                     |
|-------------|-----------------------------------------------------------------|
| Frontend    | Vite, React, JavaScript, React Router, axios                   |
| Backend     | Node.js, Express.js, cors, dotenv, jsonwebtoken, bcrypt, mariadb|
| Database    | MariaDB                                                        |
| Auth        | JWT (JSON Web Token), bcrypt                                   |
| Tools       | Git, VS Code, Postman                                          |

---

## Project Structure

```bash
intranet-kochbuch/
├── backend/                 → Backend logic (API, routes, DB connection)
│   ├── index.js            → Main server entry point
│   ├── package.json        → Backend dependencies
│   └── db/                 → Database configuration/scripts
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

- Passwords are securely hashed and stored
- Password policy: min. 8 characters, one uppercase letter, one number, one special character (!@$%?)
- JWT authentication required for all protected routes
- HTTPS recommended for production environments

---

## Installation Guide

### Prerequisites:

- Node.js v22.15.1 or v20+
- MariaDB
- Git

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Configure your database connection in a `.env` or `config.js` file.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be served via **Vite** on [http://localhost:5173](http://localhost:5173) by default.

---

## License

This project is part of the **IHK Umschulung for Fachinformatiker/in – Application Development** at **Comhard GmbH, Berlin**.  
All content is for educational and non-commercial use.

---

**Happy cooking and coding! 👨‍🍳👩‍💻**
