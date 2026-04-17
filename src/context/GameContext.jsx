import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { currentUser, initialGames, initialFriends } from '../data/initialData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { GameContext } from './game-context'

const defaultState = {
  currentUser,
  games: initialGames,
  friends: initialFriends,
  userVotes: {}, // Track which options user has voted for
}

const POLL_DURATION_MS = 1000 * 60 * 5
const PRIMARY_OPEN_POLL_NAME = 'game night poll'

function isGameNightPoll(game) {
  const normalizedName = game.name?.trim().toLowerCase() || ''

  return (
    normalizedName === PRIMARY_OPEN_POLL_NAME ||
    (normalizedName.includes('game night') && normalizedName.includes('poll'))
  )
}

function createGameId() {
  return `game-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function createPollGame(name, description, options) {
  const mappedOptions = options.map((text, index) => ({
    id: `opt-${Date.now()}-${index}`,
    text,
    votes: 0,
  }))

  return {
    id: createGameId(),
    name,
    description,
    type: 'poll',
    status: 'active',
    createdBy: 'u-001',
    createdAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + POLL_DURATION_MS).toISOString(),
    options: mappedOptions,
    displayPercentages: Object.fromEntries(mappedOptions.map((option) => [option.id, 0])),
    totalVotes: 0,
  }
}

function getEffectivePollEndsAtMs(game) {
  const createdAtMs = game.createdAt ? new Date(game.createdAt).getTime() : NaN
  const configuredEndsAtMs = game.endsAt ? new Date(game.endsAt).getTime() : NaN

  if (Number.isFinite(createdAtMs)) {
    return createdAtMs + POLL_DURATION_MS
  }

  return configuredEndsAtMs
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'VOTE_ON_POLL': {
      const { gameId, optionId } = action.payload

      if (state.userVotes[gameId]) {
        return state
      }

      const gameIndex = state.games.findIndex((g) => g.id === gameId)

      if (gameIndex === -1) return state

      const updatedGames = [...state.games]
      const game = { ...updatedGames[gameIndex] }
      const pollEndsAt = getEffectivePollEndsAtMs(game)
      const isExpired = Number.isFinite(pollEndsAt) && pollEndsAt <= Date.now()

      if (isExpired || game.status === 'ended') {
        updatedGames[gameIndex] = {
          ...game,
          status: 'ended',
        }

        return {
          ...state,
          games: updatedGames,
        }
      }

      const baseDisplayPercentages =
        game.displayPercentages ||
        Object.fromEntries(
          game.options.map((option) => [
            option.id,
            game.totalVotes > 0 ? Math.round((option.votes / game.totalVotes) * 100) : 0,
          ]),
        )

      const optionIndex = game.options.findIndex((opt) => opt.id === optionId)
      const participantCount = Math.max(1, (state.friends?.length || 0) + 1)

      if (optionIndex !== -1) {
        game.options = [...game.options]
        game.options[optionIndex] = {
          ...game.options[optionIndex],
          votes: game.options[optionIndex].votes + 1,
        }
        game.totalVotes += 1
        const votedOption = game.options[optionIndex]
        const votedOptionPercent = Math.min(
          100,
          Math.round((votedOption.votes / participantCount) * 100),
        )
        game.displayPercentages = {
          ...baseDisplayPercentages,
          [optionId]: Math.max(baseDisplayPercentages[optionId] || 0, votedOptionPercent),
        }
        updatedGames[gameIndex] = game
      }

      return {
        ...state,
        games: updatedGames,
        userVotes: {
          ...state.userVotes,
          [gameId]: optionId,
        },
      }
    }

    case 'CREATE_POLL': {
      const newGame = action.payload

      return {
        ...state,
        games: [newGame, ...state.games],
      }
    }

    case 'END_GAME': {
      const { gameId } = action.payload

      return {
        ...state,
        games: state.games.map((game) =>
          game.id === gameId ? { ...game, status: 'ended' } : game,
        ),
      }
    }

    case 'REOPEN_POLL_WINDOWS': {
      const { nowMs } = action.payload
      const nextUserVotes = { ...state.userVotes }
      const pollGames = state.games.filter((game) => game.type === 'poll')
      const gameNightPollId =
        pollGames.find((game) => isGameNightPoll(game))?.id || pollGames[0]?.id

      return {
        ...state,
        games: state.games.map((game) => {
          if (game.type !== 'poll') {
            return game
          }

          const isPrimaryOpenPoll = game.id === gameNightPollId

          if (!isPrimaryOpenPoll) {
            return {
              ...game,
              status: 'ended',
            }
          }

          const resetOptions = (game.options || []).map((option) => ({
            ...option,
            votes: 0,
          }))

          delete nextUserVotes[game.id]

          return {
            ...game,
            status: 'active',
            createdAt: new Date(nowMs).toISOString(),
            endsAt: new Date(nowMs + POLL_DURATION_MS).toISOString(),
            options: resetOptions,
            totalVotes: 0,
            displayPercentages: Object.fromEntries(
              resetOptions.map((option) => [option.id, 0]),
            ),
          }
        }),
        userVotes: nextUserVotes,
      }
    }

    case 'ADD_FRIEND': {
      const { name, status } = action.payload

      const newFriend = {
        id: `u-${Date.now()}`,
        name,
        status: status || 'Offline',
      }

      return {
        ...state,
        friends: [newFriend, ...state.friends],
      }
    }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [storedState, setStoredState] = useLocalStorage('game-night-state', defaultState)
  const migratedStoredState = useMemo(() => {
    const friends = storedState.friends || []
    const hasLegacyName = friends.some((friend) => friend.name === 'Ahsan')
    const canonicalTriviaGame = initialGames.find((game) => game.type === 'trivia')
    const games = storedState.games || []

    const didMigrateGames = games.some((game) => {
      if (game.type === 'poll') {
        const createdAtMs = game.createdAt ? new Date(game.createdAt).getTime() : NaN
        const currentEndsAt = game.endsAt ? new Date(game.endsAt).getTime() : NaN

        if (!Number.isFinite(createdAtMs)) {
          return false
        }

        const expectedEndsAt = createdAtMs + POLL_DURATION_MS
        const hasTimerMismatch = !Number.isFinite(currentEndsAt) || currentEndsAt !== expectedEndsAt

        const charadesOption = (game.options || []).find(
          (option) => option.text?.trim().toLowerCase() === 'family charades',
        )
        const charadesDisplay = charadesOption
          ? game.displayPercentages?.[charadesOption.id]
          : undefined
        const fallbackCharadesPercent =
          charadesOption && game.totalVotes > 0
            ? Math.round((charadesOption.votes / game.totalVotes) * 100)
            : 0
        const shouldLowerCharades =
          Boolean(charadesOption) &&
          ((typeof charadesDisplay === 'number' && charadesDisplay > 45) ||
            (typeof charadesDisplay !== 'number' && fallbackCharadesPercent > 45))

        return hasTimerMismatch || shouldLowerCharades
      }

      if (game.type !== 'trivia' || !canonicalTriviaGame) {
        return false
      }

      const questions = game.questions || []
      const uniqueQuestionTexts = new Set(questions.map((question) => question.text)).size
      return questions.length !== 3 || uniqueQuestionTexts !== 3
    })

    const migratedGames = games.map((game) => {
      if (game.type === 'poll') {
        const createdAtMs = game.createdAt ? new Date(game.createdAt).getTime() : NaN

        if (!Number.isFinite(createdAtMs)) {
          return game
        }

        const expectedEndsAtIso = new Date(createdAtMs + POLL_DURATION_MS).toISOString()
        let updatedGame = game

        if (game.endsAt !== expectedEndsAtIso) {
          updatedGame = {
            ...updatedGame,
            endsAt: expectedEndsAtIso,
            status: 'active',
          }
        }

        const charadesOption = (updatedGame.options || []).find(
          (option) => option.text?.trim().toLowerCase() === 'family charades',
        )

        if (!charadesOption) {
          return updatedGame
        }

        const currentDisplay = updatedGame.displayPercentages?.[charadesOption.id]
        const fallbackPercent =
          updatedGame.totalVotes > 0
            ? Math.round((charadesOption.votes / updatedGame.totalVotes) * 100)
            : 0
        const shouldLowerCharades =
          (typeof currentDisplay === 'number' && currentDisplay > 45) ||
          (typeof currentDisplay !== 'number' && fallbackPercent > 45)

        if (!shouldLowerCharades) {
          return updatedGame
        }

        return {
          ...updatedGame,
          displayPercentages: {
            ...(updatedGame.displayPercentages || {}),
            [charadesOption.id]: 45,
          },
        }
      }

      if (game.type !== 'trivia' || !canonicalTriviaGame) {
        return game
      }

      const questions = game.questions || []
      const uniqueQuestionTexts = new Set(questions.map((question) => question.text)).size
      const hasInvalidTriviaSet = questions.length !== 3 || uniqueQuestionTexts !== 3

      if (!hasInvalidTriviaSet) {
        return game
      }

      return {
        ...game,
        description: canonicalTriviaGame.description,
        questions: canonicalTriviaGame.questions,
      }
    })

    const hasTriviaGame = migratedGames.some((game) => game.type === 'trivia')
    const ensuredGames = hasTriviaGame || !canonicalTriviaGame
      ? migratedGames
      : [...migratedGames, canonicalTriviaGame]
    const didAddTriviaGame = !hasTriviaGame && Boolean(canonicalTriviaGame)
    const didChangeGames = didMigrateGames || didAddTriviaGame

    if (!hasLegacyName && !didChangeGames) {
      return storedState
    }

    return {
      ...storedState,
      games: ensuredGames,
      friends: friends.map((friend) =>
        friend.name === 'Ahsan' ? { ...friend, name: 'Jessica' } : friend,
      ),
    }
  }, [storedState])

  const [state, dispatch] = useReducer(gameReducer, migratedStoredState)

  useEffect(() => {
    dispatch({
      type: 'REOPEN_POLL_WINDOWS',
      payload: { nowMs: Date.now() },
    })
  }, [])

  useEffect(() => {
    setStoredState(state)
  }, [setStoredState, state])

  const voteOnPoll = useCallback((gameId, optionId) => {
    dispatch({
      type: 'VOTE_ON_POLL',
      payload: { gameId, optionId },
    })
  }, [])

  const createPoll = useCallback((name, description, options) => {
    const newGame = createPollGame(name, description, options)
    dispatch({
      type: 'CREATE_POLL',
      payload: newGame,
    })
    return newGame.id
  }, [])

  const endGame = useCallback((gameId) => {
    dispatch({
      type: 'END_GAME',
      payload: { gameId },
    })
  }, [])

  const addFriend = useCallback((name, status) => {
    dispatch({
      type: 'ADD_FRIEND',
      payload: { name, status },
    })
  }, [])

  const value = useMemo(
    () => ({
      state,
      voteOnPoll,
      createPoll,
      endGame,
      addFriend,
    }),
    [state, voteOnPoll, createPoll, endGame, addFriend],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
