import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

function AppLayout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
