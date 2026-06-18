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
    GAME: '/wordle/game',
    SHARE: '/wordle/share',
    BEFORE: {
      DAILY: '/wordle/before/daily',
      PRACTICE: '/wordle/before/practice'
    }
  },
  PROFILE: {
    BASE: '/profile',
    USER: '/profile/user',
    PASSWORD: '/profile/password',
    AVATAR: '/profile/avatar'
  }
};

// cookie, token
export const TOKEN_KEY = 'alpjom_token';
export const REFRESH_TOKEN_KEY = 'alpjom_refresh_token';

// localstorage, user
export const USER_KEY = 'alpjom-user';
