import express from "express";
import cors from "cors";

import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';

//--------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

//--------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({ status: "Hello World!" });
});

//--------------------------------------------------------------------------

app.use('/api/recipes', recipesRouter);
app.use('/api/users', usersRouter);

//--------------------------------------------------------------------------

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://backend-api.com:${PORT}`);
});