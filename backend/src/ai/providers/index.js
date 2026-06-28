import { GeminiProvider } from './gemini.provider.js';
import { GroqProvider } from './groq.provider.js';
import { OpenRouterProvider } from './openrouter.provider.js';

class ProviderManager {
  constructor() {
    this.providers = [GeminiProvider, GroqProvider, OpenRouterProvider];
    this.configuredProviders = this.providers.filter(p => p.isConfigured());
    this.state = new Map();

    for (const p of this.configuredProviders) {
      p.init();
      this.state.set(p.name, {
        failures: 0,
        unhealthyUntil: 0
      });
    }
  }

  _isHealthy(providerName) {
    const state = this.state.get(providerName);
    if (!state) return false;
    
    if (state.unhealthyUntil > Date.now()) {
      return false; // Circuit is open
    }
    
    // Half-open / Reset
    if (state.unhealthyUntil > 0 && state.unhealthyUntil <= Date.now()) {
      state.failures = 0;
      state.unhealthyUntil = 0;
    }
    return true;
  }

  _recordFailure(providerName, isTransient) {
    const state = this.state.get(providerName);
    if (!state) return;

    if (isTransient) {
      state.failures += 1;
      if (state.failures >= 3) {
        // Trip circuit breaker
        state.unhealthyUntil = Date.now() + 60000; // 60s cooldown
        console.warn(`[AI Gateway] Circuit breaker tripped for ${providerName}. Cooldown 60s.`);
      }
    } else {
      // Fatal error (e.g. 401 Unauthorized). Fail instantly and put on long cooldown.
      state.failures = 3;
      state.unhealthyUntil = Date.now() + 300000; // 5m cooldown
      console.error(`[AI Gateway] Fatal error for ${providerName}. Circuit tripped for 5m.`);
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generate(prompt, systemInstruction = '') {
    if (this.configuredProviders.length === 0) {
      console.error('[AI Gateway] No AI providers are configured!');
      return { success: false, data: null, provider: null };
    }

    const startTs = Date.now();
    const attemptedProviders = new Set();

    for (const provider of this.configuredProviders) {
      if (!this._isHealthy(provider.name)) continue;
      
      attemptedProviders.add(provider.name);

      try {
        const analyzePromise = provider.analyze(prompt, systemInstruction);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => {
            const err = new Error("Provider Gateway Timeout");
            err.isTransient = true;
            reject(err);
          }, 6000)
        );

        const result = await Promise.race([analyzePromise, timeoutPromise]);
        
        if (!result) throw new Error("Empty response");

        // Reset failures on success
        const state = this.state.get(provider.name);
        if (state) state.failures = 0;

        const executionTimeMs = Date.now() - startTs;
        console.log(JSON.stringify({
          event: "AI Analysis",
          configuredProviders: this.configuredProviders.map(p => p.name),
          attemptedProviders: Array.from(attemptedProviders),
          successfulProvider: provider.name,
          executionTimeMs
        }));

        return { success: true, data: result, provider: provider.name };
      } catch (error) {
        console.warn(`[AI Gateway] ${provider.name} failed: ${error.message}`);
        this._recordFailure(provider.name, error.isTransient);
        // Instantly fallback to the next provider!
      }
    }

    console.error(JSON.stringify({
      event: "AI Analysis Failed",
      configuredProviders: this.configuredProviders.map(p => p.name),
      attemptedProviders: Array.from(attemptedProviders),
      error: "All configured providers failed or are unhealthy",
      executionTimeMs: Date.now() - startTs
    }));

    return { success: false, data: null, provider: null };
  }
}

export const aiGateway = new ProviderManager();
