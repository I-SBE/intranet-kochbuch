import express from "express";
import cors from "cors";
import dotenv from 'dotenv';


import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';
import commentRoutes from './routes/comments.js';
import contactRouter from './routes/contact.js';

//--------------------------------------------------------------------------

dotenv.config();
const app = express();
app.use(cors({
  origin: 'http://frontend.com:3000',
  credentials: true
}));
app.use(express.json());

//--------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({ status: "Hello World!" });
});

//--------------------------------------------------------------------------

app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/profile_pics', express.static('profile_pics'));
app.use('/uploads', express.static('uploads'));
app.use('/api/comments', commentRoutes);
app.use("/api/contact", contactRouter);

//--------------------------------------------------------------------------

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://backend-api.com:${PORT}`);
});