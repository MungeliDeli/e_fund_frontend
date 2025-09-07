// main.jsx
// This is the main entry point for the React application.
// It renders the App component into the root DOM element and applies global styles.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
 
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  
)
