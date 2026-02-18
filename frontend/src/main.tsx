import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Prevent browser from restoring scroll — we control it on navigation
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

