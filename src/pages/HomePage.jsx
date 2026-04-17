import { Link } from 'react-router-dom'
import StatCard from '../components/ui/StatCard'
import { useChat } from '../hooks/useChat'

function HomePage() {
  const {
    state: { games, friends, currentUser },
  } = useChat()

  const activeGames = games.filter((g) => g.status === 'active').length
  const onlineFriends = friends.filter((f) => f.status === 'Online').length
  const totalVotes = games.reduce((sum, g) => sum + (g.totalVotes || 0), 0)

  return (
    <section className="page fade-in">
      <div className="page-heading">
        <h1>Welcome, {currentUser.name}!</h1>
        <p className="home-intro" style={{ color: '#000' }}>
          Start polls, host games, and have fun with friends and family.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Active Polls"
          value={activeGames}
          detail="Ongoing games and polls you can vote on"
          detailClassName="stat-detail--dark"
        />
        <StatCard
          label="Total Votes"
          value={totalVotes}
          detail="Votes collected across all polls"
          detailClassName="stat-detail--dark"
        />
        <StatCard
          label="Friends Online"
          value={onlineFriends}
          detail={`Out of ${friends.length} total friends`}
          detailClassName="stat-detail--dark"
        />
      </div>

      <div className="split-grid">
        <article className="card" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ marginTop: 0, marginBottom: '12px', fontWeight: 800 }}>Quick Start</h2>
          <p style={{ marginBottom: '16px', color: '#666' }}>Jump into the action:</p>
          <div className="quick-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link 
              className="button" 
              to="/games"
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                textAlign: 'center',
                fontSize: '0.95rem',
              }}
            >
              Browse Games
            </Link>
            <Link 
              className="button" 
              to="/friends"
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #87ceeb 0%, #00bfff 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                textAlign: 'center',
                fontSize: '0.95rem',
              }}
            >
              View Friends
            </Link>
          </div>
        </article>

        <article className="card" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ marginTop: 0, marginBottom: '12px', fontWeight: 800 }}>How to Play</h2>
          <p style={{ color: '#666', marginBottom: '12px' }}>
            Create polls, invite friends, and vote on outcomes. Keep track of your favorite games and results.
          </p>
          <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#000', marginBottom: 0 }}>
            All games and votes are saved locally. Perfect for game nights!
          </p>
        </article>
      </div>
    </section>
  )
}

export default HomePage
