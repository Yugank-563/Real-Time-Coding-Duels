import BaseDriver from './base.driver.js';
import UniversalCppDriver from './cpp/universalDriver.js';
import { LEGACY_DRIVERS, getLegacyHeader } from './cpp/customDrivers.js';

export { UniversalCppDriver };

export class CppDriver extends BaseDriver {
  /**
   * Wrap user C++ code in a compilable driver program.
   * Prioritizes exact legacy exception matching for special cases (e.g. linked list cycle pointer mutation),
   * then uses the universal C++ template harness driver.
   */
  wrap(code, problemTitle = '') {
    const titleNorm = problemTitle ? problemTitle.trim().toLowerCase() : '';
    
    // ── LEGACY EXCEPTION PATH: for specialized pointer mutations ──
    if (titleNorm && LEGACY_DRIVERS && LEGACY_DRIVERS[titleNorm]) {
      const header = getLegacyHeader(titleNorm);
      const driver = LEGACY_DRIVERS[titleNorm]();
      return `${header}\n// %%USER_CODE_START%%\n${code}\n${driver}`;
    }

    // ── UNIVERSAL C++ TEMPLATE HARNESS PATH ──
    const universalDriver = new UniversalCppDriver();
    return universalDriver.wrap(code, problemTitle);
  }
}

export default CppDriver;
