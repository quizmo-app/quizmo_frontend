import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Polices de la charte, servies localement (aucun CDN).
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/700.css'
import '@fontsource/fredoka/700.css'
import './index.css'
import { App } from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
