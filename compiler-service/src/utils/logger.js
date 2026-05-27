export const logger = {
  info: (message, ...args) => {
    console.log(`[Compiler Service] Info: ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[Compiler Service] Warn: ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[Compiler Service] Error: ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Compiler Service] Debug: ${message}`, ...args);
    }
  }
};
export default logger;
