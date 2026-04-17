function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button className="button button--ghost" onClick={onRetry} type="button">
          Retry
        </button>
      ) : null}
    </div>
  )
}

export default ErrorBanner
