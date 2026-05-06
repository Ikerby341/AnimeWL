import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { installAuthTokenFetch } from './utils/authTokenFetch.js'

installAuthTokenFetch()

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
