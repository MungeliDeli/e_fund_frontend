/**
 * Simple logger utility for frontend
 */

const isDevelopment = process.env.NODE_ENV === "development";

const logger = {
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

export default logger;


