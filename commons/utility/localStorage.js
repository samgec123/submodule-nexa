export const CONSTANTS = {
  INACTIVE_TIME: 1800,
  MILLISECONDS_MULTIPLIER: 1000,
  TOKEN_TIMEOUT: 3600,
  PHONE_NUMBER_SUB: 3,
  CANCELLATION_LIMIT: 6,
  DEALER_CODE_DELHI: '08',
  INDIA_MOBILE_CODE: '+91',
  MAX_AGE: '31536000',
  NAVIGATION_TIMEOUT: 200,
  CHAR_MIN_LENGTH: 5,
};

export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

export const removeLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const getLocalStorage = (key) => localStorage.getItem(key);
