import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.tsx'
import './i18n'

// Force light mode when printing from dark mode
window.addEventListener('beforeprint', () => {
  document.documentElement.style.colorScheme = 'light'
  document.documentElement.setAttribute('data-printing', 'true')
})
window.addEventListener('afterprint', () => {
  document.documentElement.style.colorScheme = ''
  document.documentElement.removeAttribute('data-printing')
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
