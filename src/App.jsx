import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { GameProvider } from './context/GameContext.jsx'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import FriendsPage from './pages/FriendsPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

function RestoreRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('spa-redirect')

    if (!redirectPath) {
      return
    }

    sessionStorage.removeItem('spa-redirect')
    navigate(redirectPath + location.search, { replace: true })
  }, [location.search, navigate])

  return null
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <GameProvider>
        <RestoreRedirect />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </GameProvider>
    </BrowserRouter>
  )
}

export default App
