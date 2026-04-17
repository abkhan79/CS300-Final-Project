import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/games', label: 'Games' },
  { to: '/friends', label: 'Friends' },
  { to: '/profile', label: 'Profile' },
]

function NavBar() {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <p className="brand-title">Game Night</p>
        <p className="brand-subtitle">Polls & Games for Friends & Family</p>
      </div>

      <nav aria-label="Primary navigation" className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link--active' : 'nav-link'
            }
            end={item.to === '/'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default NavBar
