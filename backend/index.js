import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));


//--------------------------------------------------------------------------

app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);
app.use('/profile_pics', express.static('profile_pics'));
app.use('/uploads', express.static('uploads'));
app.use('/api/comments', commentRoutes);
app.use("/api/contact", contactRouter);

//--------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

//--------------------------------------------------------------------------

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://backend-api.com:${PORT}`);
});