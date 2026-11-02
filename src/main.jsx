import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './contexts/userProvider.jsx'
import { MarketProvider } from './contexts/marketProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <MarketProvider>
        <App />
      </MarketProvider>
    </UserProvider>
  </StrictMode>,
)
