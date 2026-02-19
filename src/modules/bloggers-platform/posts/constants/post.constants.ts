export const POST = {
  TITLE: {
    MIN: 3,
    MAX: 30,
  },

  SHORT_DESCRIPTION: {
    MIN: 3,
    MAX: 100,
  },

  CONTENT: { MIN: 3, MAX: 1000 },
} as const;
