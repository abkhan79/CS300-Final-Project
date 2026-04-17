function StatCard({ label, value, detail, detailClassName = '' }) {
  return (
    <article className="card stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className={`stat-detail ${detailClassName}`.trim()}>{detail}</p>
    </article>
  )
}

export default StatCard
