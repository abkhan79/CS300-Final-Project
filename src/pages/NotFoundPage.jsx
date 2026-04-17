import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page fade-in">
      <article className="card empty-state">
        <h1>404</h1>
        <p>The page you requested does not exist.</p>
        <Link className="button" to="/">
          Go to Dashboard
        </Link>
      </article>
    </section>
  )
}

export default NotFoundPage
