// api
export const API = {
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  WORDLE: {
    START: '/wordle/start',
    GUESS: '/wordle/guess',
    GAME: '/wordle/game'
  }
};

// cookie, token
export const TOKEN_KEY = 'alpjom_token';
export const REFRESH_TOKEN_KEY = 'alpjom_refresh_token';
