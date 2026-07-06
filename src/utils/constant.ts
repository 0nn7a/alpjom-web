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
    LIKE: '/wordle/like',
    COMMENT: '/wordle/comment',
    BEFORE: {
      DAILY: '/wordle/before/daily',
      PRACTICE: '/wordle/before/practice'
    }
  },
  PROFILE: {
    BASE: '/profile',
    USER: '/profile/user',
    PASSWORD: '/profile/password',
    AVATAR: '/profile/avatar',
    FOLLOW: {
      BASE: '/profile/follow',
      FOLLOWER: '/profile/follow/list/follower',
      FOLLOWING: '/profile/follow/list/following'
    }
  }
};

// cookie, token
export const TOKEN_KEY = 'alpjom_token';
export const REFRESH_TOKEN_KEY = 'alpjom_refresh_token';

// localstorage, user
export const USER_KEY = 'alpjom-user';
