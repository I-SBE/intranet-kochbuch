import express from "express";
import cors from "cors";
import session from 'express-session';
import dotenv from 'dotenv';


import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';

//--------------------------------------------------------------------------

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

//--------------------------------------------------------------------------

app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false, // Don't resave session if not changed
  saveUninitialized: false, // Don't save if not Logged in
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}));

//--------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({ status: "Hello World!" });
});

//--------------------------------------------------------------------------

app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/profile_pics', express.static('profile_pics'));

//--------------------------------------------------------------------------

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://backend-api.com:${PORT}`);
});