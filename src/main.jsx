import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './Supabase'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return session ? <Dashboard /> : <Login />
}

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
)