export const currentUser = {
  id: 'u-001',
  name: 'Aliya',
  status: 'Active',
  role: 'Game Night Host',
}

export const initialGames = [
  {
    id: 'game-1',
    name: 'Movie Night Vote',
    description: 'Which movie should we watch this weekend?',
    type: 'poll',
    status: 'active',
    createdBy: 'u-001',
    createdAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
    options: [
      { id: 'opt-1', text: 'Dune 2', votes: 3 },
      { id: 'opt-2', text: 'Inside Out 2', votes: 2 },
      { id: 'opt-3', text: 'Avatar 3', votes: 1 },
    ],
    totalVotes: 6,
  },
  {
    id: 'game-2',
    name: 'Trivia Challenge',
    description: 'A quick round of winter game night trivia!',
    type: 'trivia',
    status: 'active',
    createdBy: 'u-002',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    questions: [
      {
        id: 'q-1',
        text: 'Which planet is known as the Red Planet?',
        options: ['Mars', 'Venus', 'Jupiter'],
        correctAnswer: 'Mars',
        responses: 4,
      },
      {
        id: 'q-2',
        text: 'How many sides does a hexagon have?',
        options: ['5', '6', '8'],
        correctAnswer: '6',
        responses: 3,
      },
      {
        id: 'q-3',
        text: 'What color do you get when you mix blue and yellow?',
        options: ['Green', 'Purple', 'Orange'],
        correctAnswer: 'Green',
        responses: 4,
      },
    ],
  },
]

export const initialFriends = [
  {
    id: 'u-002',
    name: 'Mom',
    status: 'Online',
  },
  {
    id: 'u-003',
    name: 'Jessica',
    status: 'Away',
  },
  {
    id: 'u-004',
    name: 'Dad',
    status: 'Offline',
  },
]

export const defaultNotifications = [
  {
    id: 'n-1',
    type: 'poll_ended',
    title: 'Pizza Night Poll Closed',
    description: 'Pepperoni won with 5 votes!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
  },
]
