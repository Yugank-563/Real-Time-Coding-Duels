import BaseDriver from './base.driver.js';
import { RegistryCppDriver } from './cpp/cppDriver.js';
import { LEGACY_DRIVERS, getLegacyHeader } from './cpp/customDrivers.js';

// ── Registry-based C++ Driver ──
export { RegistryCppDriver }; // re-export so consumers can use new driver directly

export class CppDriver extends BaseDriver {
  /**
   * Wrap user C++ code in a compilable driver program.
   * Prioritizes exact legacy string matching for execution stability,
   * then falls back to the dynamic AST registry.
   */
  wrap(code, problemTitle) {
    const titleNorm = problemTitle.trim().toLowerCase();
    
    // ── LEGACY PATH: hardcoded 100% matched behavior ──
    if (LEGACY_DRIVERS && LEGACY_DRIVERS[titleNorm]) {
      const header = getLegacyHeader(titleNorm);
      const driver = LEGACY_DRIVERS[titleNorm]();
      return `${header}\n// %%USER_CODE_START%%\n${code}\n${driver}`;
    }

    // ── REGISTRY PATH: dynamic AST parsing ──
    const registryDriver = new RegistryCppDriver();
    return registryDriver.wrap(code, problemTitle);
  }
}

export default CppDriver;
