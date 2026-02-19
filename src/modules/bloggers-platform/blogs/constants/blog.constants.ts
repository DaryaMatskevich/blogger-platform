export const BLOG = {
  NAME: {
    MIN: 1,
    MAX: 15,
  },
  DESCRIPTION: {
    MIN: 1,
    MAX: 500,
  },

  WEBSITE_URL: {
    MIN: 1,
    MAX: 100,
    URL_PATTERN:
      /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  },
} as const;
