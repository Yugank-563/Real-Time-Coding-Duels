export class BaseDriver {
  /**
   * Wrap the user code in an executable template.
   * @param {string} code - User solution code
   * @param {string} problemTitle - Title of the problem
   * @returns {string} - Wrapped executable program code
   */
  wrap(code, problemTitle) {
    throw new Error('wrap() method must be implemented by concrete Driver class');
  }
}
export default BaseDriver;
