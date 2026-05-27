import CppDriver from './cpp.driver.js';

class DriverFactory {
  constructor() {
    this.drivers = {
      cpp: new CppDriver(),
    };
  }

  /**
   * Get dynamic driver based on language.
   * @param {string} language - Target language
   * @returns {BaseDriver|null}
   */
  getDriver(language) {
    const langNorm = language?.toLowerCase();
    if (this.drivers[langNorm]) {
      return this.drivers[langNorm];
    }
    // Return null or fallback if no driver mapping is registered for language (e.g. Python/JS bypass wrapper for now)
    return null;
  }
}

export const driverFactory = new DriverFactory();
export default driverFactory;
