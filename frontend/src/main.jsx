import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './styles/index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from "./context/FavoritesContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  </StrictMode>,
)
