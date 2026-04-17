import { useCallback, useEffect, useState } from 'react'
import { useChat } from '../hooks/useChat'

const TRIVIA_TIME_LIMIT = 12
const POLL_DURATION_MS = 1000 * 60 * 5

function formatPollCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getEffectivePollEndsAtMs(game) {
  const createdAtMs = game.createdAt ? new Date(game.createdAt).getTime() : NaN
  const configuredEndsAtMs = game.endsAt ? new Date(game.endsAt).getTime() : NaN

  if (Number.isFinite(createdAtMs)) {
    return createdAtMs + POLL_DURATION_MS
  }

  return configuredEndsAtMs
}

function GamesPage() {
  const {
    state: { games, userVotes },
    voteOnPoll,
    createPoll,
  } = useChat()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [pollName, setPollName] = useState('')
  const [pollDescription, setPollDescription] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [triviaProgress, setTriviaProgress] = useState({})
  const [triviaSecondsLeft, setTriviaSecondsLeft] = useState({})
  const [pollNowMs, setPollNowMs] = useState(0)

  const filteredGames = games.filter((game) => {
    if (filter === 'active' && game.status !== 'active') return false
    if (filter === 'ended' && game.status !== 'ended') return false
    if (!search.trim()) return true

    const query = search.toLowerCase()
    return (
      game.name.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query)
    )
  })

  function handleCreatePoll(event) {
    event.preventDefault()

    const validOptions = pollOptions.filter((opt) => opt.trim())
    if (!pollName.trim() || !pollDescription.trim() || validOptions.length < 2) {
      return
    }

    createPoll(pollName, pollDescription, validOptions)

    setPollName('')
    setPollDescription('')
    setPollOptions(['', ''])
    setShowCreateForm(false)
  }

  function handleTriviaAnswer(gameId, selectedAnswer, correctAnswer) {
    setTriviaProgress((previousProgress) => {
      const gameProgress = previousProgress[gameId] || {
        currentQuestionIndex: 0,
        score: 0,
        completed: false,
        selectedAnswer: null,
        isCorrect: null,
      }

      if (gameProgress.completed || gameProgress.selectedAnswer) {
        return previousProgress
      }

      const isCorrect = selectedAnswer === correctAnswer

      return {
        ...previousProgress,
        [gameId]: {
          ...gameProgress,
          selectedAnswer,
          isCorrect,
          score: isCorrect ? gameProgress.score + 1 : gameProgress.score,
        },
      }
    })
  }

  const handleTriviaNext = useCallback((game) => {
    let questionIndexToInitialize = 0

    setTriviaProgress((previousProgress) => {
      const gameProgress = previousProgress[game.id] || {
        currentQuestionIndex: 0,
        score: 0,
        completed: false,
        selectedAnswer: null,
        isCorrect: null,
      }

      const nextQuestionIndex = gameProgress.currentQuestionIndex + 1
      const isLastQuestion = nextQuestionIndex >= game.questions.length
      questionIndexToInitialize = isLastQuestion
        ? gameProgress.currentQuestionIndex
        : nextQuestionIndex

      return {
        ...previousProgress,
        [game.id]: {
          ...gameProgress,
          currentQuestionIndex: isLastQuestion
            ? gameProgress.currentQuestionIndex
            : nextQuestionIndex,
          completed: isLastQuestion,
          selectedAnswer: null,
          isCorrect: null,
        },
      }
    })

    setTriviaSecondsLeft((previousSecondsLeft) => ({
      ...previousSecondsLeft,
      [game.id]: {
        ...(previousSecondsLeft[game.id] || {}),
        [questionIndexToInitialize]: TRIVIA_TIME_LIMIT,
      },
    }))
  }, [])

  useEffect(() => {
    const updateNow = () => {
      setPollNowMs(Date.now())
    }

    updateNow()
    const pollIntervalId = setInterval(updateNow, 1000)

    return () => clearInterval(pollIntervalId)
  }, [])

  useEffect(() => {
    const activeTriviaGames = games.filter((game) => game.type === 'trivia')

    const intervalId = setInterval(() => {
      setTriviaSecondsLeft((previousSecondsLeft) => {
        let hasChanges = false
        const nextSecondsLeft = { ...previousSecondsLeft }

        activeTriviaGames.forEach((game) => {
          const progress = triviaProgress[game.id] || {
            currentQuestionIndex: 0,
            score: 0,
            completed: false,
            selectedAnswer: null,
            isCorrect: null,
          }

          if (progress.completed || progress.selectedAnswer) {
            return
          }

          const gameSecondsLeft = nextSecondsLeft[game.id] || {}
          const currentSeconds = gameSecondsLeft[progress.currentQuestionIndex]

          if (typeof currentSeconds !== 'number') {
            nextSecondsLeft[game.id] = {
              ...gameSecondsLeft,
              [progress.currentQuestionIndex]: TRIVIA_TIME_LIMIT,
            }
            hasChanges = true
            return
          }

          if (currentSeconds <= 1) {
            nextSecondsLeft[game.id] = {
              ...gameSecondsLeft,
              [progress.currentQuestionIndex]: 0,
            }

            setTriviaProgress((previousProgress) => {
              const gameProgress = previousProgress[game.id] || progress

              if (gameProgress.completed || gameProgress.selectedAnswer) {
                return previousProgress
              }

              return {
                ...previousProgress,
                [game.id]: {
                  ...gameProgress,
                  selectedAnswer: '__timeout__',
                  isCorrect: false,
                },
              }
            })

            hasChanges = true
            return
          }

          nextSecondsLeft[game.id] = {
            ...gameSecondsLeft,
            [progress.currentQuestionIndex]: currentSeconds - 1,
          }
          hasChanges = true
        })

        return hasChanges ? nextSecondsLeft : previousSecondsLeft
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [games, triviaProgress, handleTriviaNext])

  useEffect(() => {
    const autoAdvanceTimers = games
      .filter((game) => game.type === 'trivia')
      .map((game) => {
        const progress = triviaProgress[game.id]

        if (!progress || progress.completed || !progress.selectedAnswer) {
          return null
        }

        return setTimeout(() => {
          handleTriviaNext(game)
        }, 1200)
      })
      .filter(Boolean)

    return () => {
      autoAdvanceTimers.forEach((timerId) => clearTimeout(timerId))
    }
  }, [games, triviaProgress, handleTriviaNext])

  return (
    <section className="page fade-in">
      <div className="page-heading">
        <h1>Games & Polls</h1>
        <p style={{ color: '#fff' }}>Create and vote on polls for game nights and decisions.</p>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <input
          className="input"
          placeholder="Search games..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="filter-pills" role="group" aria-label="Game filters">
          <button
            className={filter === 'all' ? 'pill pill--active' : 'pill'}
            onClick={() => setFilter('all')}
            type="button"
          >
            All
          </button>
          <button
            className={filter === 'active' ? 'pill pill--active' : 'pill'}
            onClick={() => setFilter('active')}
            type="button"
          >
            Active
          </button>
          <button
            className={filter === 'ended' ? 'pill pill--active' : 'pill'}
            onClick={() => setFilter('ended')}
            type="button"
          >
            Ended
          </button>
        </div>
      </div>

      <button
        className="button"
        onClick={() => setShowCreateForm(!showCreateForm)}
        type="button"
        style={{ marginBottom: '12px' }}
      >
        {showCreateForm ? 'Cancel' : '+ Create Poll'}
      </button>

      {showCreateForm && (
        <article className="card" style={{ padding: '24px', marginBottom: '24px', background: '#fff' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontWeight: 800 }}>Create a New Poll</h2>
          <form className="stack-form" onSubmit={handleCreatePoll}>
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="pollName" style={{
                display: 'block',
                fontWeight: 700,
                marginBottom: '6px',
                fontSize: '0.9rem',
              }}>
                Poll Title
              </label>
              <input
                id="pollName"
                className="input"
                placeholder="e.g. Movie Night Vote"
                value={pollName}
                onChange={(event) => setPollName(event.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="pollDescription" style={{
                display: 'block',
                fontWeight: 700,
                marginBottom: '6px',
                fontSize: '0.9rem',
              }}>
                Description (optional)
              </label>
              <input
                id="pollDescription"
                className="input"
                placeholder="What is this poll about?"
                value={pollDescription}
                onChange={(event) => setPollDescription(event.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontWeight: 700,
                marginBottom: '8px',
                fontSize: '0.9rem',
              }}>
                Options
              </label>
              {pollOptions.map((option, index) => (
                <div key={index} style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                  <input
                    className="input"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(event) => {
                      const newOptions = [...pollOptions]
                      newOptions[index] = event.target.value
                      setPollOptions(newOptions)
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '2px solid #e0e0e0',
                      fontSize: '0.95rem',
                    }}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                      style={{
                        padding: '8px 12px',
                        background: '#ffcccc',
                        color: '#c00',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                className="button button--ghost button--small"
                onClick={() => setPollOptions([...pollOptions, ''])}
                type="button"
                style={{
                  padding: '8px 12px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginTop: '4px',
                }}
              >
                + Add Option
              </button>
            </div>

            <button 
              className="button" 
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              Create Poll
            </button>
          </form>
        </article>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredGames.length ? (
          filteredGames.map((game, index) => {
            const colors = [
              { bg: 'linear-gradient(135deg, #90ee90 0%, #7cfc00 100%)', header: '#00aa00' },
              { bg: 'linear-gradient(135deg, #87ceeb 0%, #00bfff 100%)', header: '#0099cc' },
              { bg: 'linear-gradient(135deg, #ba55d3 0%, #9932cc 100%)', header: '#7722aa' },
              { bg: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', header: '#ff9900' },
            ]
            const colorScheme = colors[index % colors.length]
            const pollEndsAtMs = game.type === 'poll' ? getEffectivePollEndsAtMs(game) : NaN
            const hasPollTimer = Number.isFinite(pollEndsAtMs)
            const pollRemainingMs = hasPollTimer ? Math.max(0, pollEndsAtMs - pollNowMs) : 0
            const isPollExpired = hasPollTimer && pollNowMs > 0 && pollRemainingMs <= 0
            const hasAlreadyVoted = Boolean(userVotes?.[game.id])

            return (
              <article
                key={game.id}
                className="card"
                style={{
                  background: colorScheme.bg,
                  padding: '0',
                  overflow: 'hidden',
                  marginBottom: 0,
                }}
              >
                <div style={{ background: colorScheme.header, padding: '16px 20px', color: '#fff' }}>
                  <h3 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.1rem' }}>
                    {game.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
                    {game.description}
                  </p>
                </div>

                <div style={{ padding: '20px' }}>
                  {game.type === 'poll' && (
                    <div>
                      <div
                        style={{
                          margin: '0 0 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                            Voting Timer
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              letterSpacing: '0.02em',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              background: 'rgba(255,255,255,0.9)',
                              color: '#374151',
                              textTransform: 'uppercase',
                            }}
                          >
                            5-minute poll
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: isPollExpired ? '#fee2e2' : 'rgba(255,255,255,0.85)',
                            color: isPollExpired ? '#b91c1c' : '#1f2937',
                          }}
                        >
                          {hasPollTimer
                            ? isPollExpired
                              ? 'Voting closed'
                              : formatPollCountdown(pollRemainingMs)
                            : '--:--'}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, opacity: 0.7 }}>
                        {game.totalVotes} votes
                      </p>
                      {game.options.map((option, optIndex) => {
                        const stickyPercentage = game.displayPercentages?.[option.id]
                        const percentage =
                          typeof stickyPercentage === 'number'
                            ? stickyPercentage
                            : game.totalVotes > 0
                              ? (option.votes / game.totalVotes) * 100
                              : 0
                        const optionColors = ['#ff4081', '#00bcd4', '#9c27b0', '#ff9800']
                        const optColor = optionColors[optIndex % optionColors.length]

                        return (
                          <div
                            key={option.id}
                            style={{
                              marginBottom: '12px',
                              cursor: isPollExpired || hasAlreadyVoted ? 'not-allowed' : 'pointer',
                              transition: 'transform 0.2s ease',
                              opacity: isPollExpired || hasAlreadyVoted ? 0.6 : 1,
                            }}
                            onClick={() => {
                              if (isPollExpired || hasAlreadyVoted) {
                                return
                              }

                              voteOnPoll(game.id, option.id)
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !isPollExpired && !hasAlreadyVoted) {
                                voteOnPoll(game.id, option.id)
                              }
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: optColor,
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  marginRight: '8px',
                                }}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span style={{ fontWeight: 600, flex: 1 }}>
                                {option.text}
                              </span>
                              <span
                                style={{
                                  background: optColor,
                                  color: '#fff',
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                }}
                              >
                                {Math.round(percentage)}%
                              </span>
                            </div>
                            <div
                              style={{
                                height: '10px',
                                background: 'rgba(255, 255, 255, 0.3)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  background: optColor,
                                  width: `${percentage}%`,
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {game.type === 'trivia' && (() => {
                    const progress = triviaProgress[game.id] || {
                      currentQuestionIndex: 0,
                      score: 0,
                      completed: false,
                      selectedAnswer: null,
                      isCorrect: null,
                    }
                    const currentQuestion = game.questions[progress.currentQuestionIndex]
                    const questionNumber = Math.min(progress.currentQuestionIndex + 1, game.questions.length)
                    const secondsLeft =
                      triviaSecondsLeft[game.id]?.[progress.currentQuestionIndex] ?? TRIVIA_TIME_LIMIT
                    const timerPercent = (secondsLeft / TRIVIA_TIME_LIMIT) * 100

                    return (
                      <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, opacity: 0.7 }}>
                            Trivia Challenge
                          </p>
                          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>
                            Score: {progress.score}/{game.questions.length}
                          </p>
                        </div>

                        {!progress.completed ? (
                          <div
                            style={{
                              padding: '14px',
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.35)',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                            }}
                          >
                            <div style={{ marginBottom: '12px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                }}
                              >
                                <span>Time left</span>
                                <span>{secondsLeft}s</span>
                              </div>
                              <div
                                style={{
                                  height: '10px',
                                  borderRadius: '999px',
                                  background: 'rgba(255, 255, 255, 0.45)',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${timerPercent}%`,
                                    height: '100%',
                                    borderRadius: '999px',
                                    background:
                                      secondsLeft > 6
                                        ? 'linear-gradient(90deg, #00bcd4 0%, #87ceeb 100%)'
                                        : 'linear-gradient(90deg, #ff9800 0%, #ff4081 100%)',
                                    transition: 'width 0.4s linear',
                                  }}
                                />
                              </div>
                            </div>

                            <p style={{ margin: '0 0 10px', fontWeight: 800 }}>
                              {questionNumber}. {currentQuestion.text}
                            </p>
                            <div style={{ display: 'grid', gap: '8px' }}>
                              {currentQuestion.options.map((option) => {
                                const isSelected = progress.selectedAnswer === option
                                const isCorrect = option === currentQuestion.correctAnswer

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    disabled={Boolean(progress.selectedAnswer)}
                                    onClick={() =>
                                      handleTriviaAnswer(game.id, option, currentQuestion.correctAnswer)
                                    }
                                    style={{
                                      padding: '10px 12px',
                                      borderRadius: '12px',
                                      border: 'none',
                                      cursor: progress.selectedAnswer ? 'default' : 'pointer',
                                      fontWeight: 700,
                                      textAlign: 'left',
                                      background: isSelected
                                        ? isCorrect
                                          ? '#d1fae5'
                                          : '#fee2e2'
                                        : '#fff',
                                      color: '#111',
                                    }}
                                  >
                                    {option}
                                  </button>
                                )
                              })}
                            </div>

                            {progress.selectedAnswer && (
                              <div style={{ marginTop: '12px' }}>
                                <p style={{ margin: 0, fontWeight: 700 }}>
                                  {progress.selectedAnswer === '__timeout__'
                                    ? `Time's up! The correct answer is ${currentQuestion.correctAnswer}.`
                                    : progress.isCorrect
                                      ? 'Correct! Nice work.'
                                      : `Not quite — the correct answer is ${currentQuestion.correctAnswer}.`}
                                </p>
                                <p style={{ margin: '8px 0 0', fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>
                                  {progress.currentQuestionIndex + 1 >= game.questions.length
                                    ? 'Finishing quiz...'
                                    : 'Loading next question...'}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: '16px',
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.4)',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                              display: 'grid',
                              gap: '10px',
                            }}
                          >
                            <p style={{ margin: 0, fontWeight: 800 }}>
                              Quiz complete! Final score: {progress.score}/{game.questions.length}
                            </p>
                            <button
                              type="button"
                              className="button"
                              onClick={() => {
                                setTriviaProgress((previousProgress) => ({
                                  ...previousProgress,
                                  [game.id]: {
                                    currentQuestionIndex: 0,
                                    score: 0,
                                    completed: false,
                                    selectedAnswer: null,
                                    isCorrect: null,
                                  },
                                }))
                              }}
                            >
                              Play Again
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </article>
            )
          })
        ) : (
          <div className="empty-state card">
            <p>No games match your search. Create one to get started!</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default GamesPage
