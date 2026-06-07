import { findProblemBySlugOrTitle } from '../../repositories/index.js';
import { fetchAndStoreProblemDetails } from '../problemService.js';

export const getProblemDetailsService = async (slug) => {
  let problem = await findProblemBySlugOrTitle(slug);
  
  const needsFetch = !problem || 
    !problem.content || 
    !problem.boilerplates || 
    !problem.boilerplates.cpp || 
    !problem.testCases || 
    problem.testCases.length === 0 || 
    problem.isFallback;

  if (needsFetch) {
    // Check if we attempted to fetch recently (reduced to 10s for checking/testing)
    const cooldownPeriod = 10 * 1000; // 10 seconds (for testing)
    const timeSinceLastAttempt = problem?.lastFetchAttempt 
      ? Date.now() - new Date(problem.lastFetchAttempt).getTime() 
      : Infinity;

    if (timeSinceLastAttempt < cooldownPeriod) {
      console.log(`[getProblemDetails.service] Fetch cooldown active for "${slug}" (${Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 1000)}s remaining). Serving local cached fallback.`);
      return problem;
    }

    console.log(`[getProblemDetails.service] Problem details missing, incomplete, or fallback for "${slug}". Fetching dynamically from LeetCode...`);
    try {
      const updated = await fetchAndStoreProblemDetails(slug);
      if (updated) {
        problem = updated;
      }
    } catch (fetchErr) {
      console.error(`[getProblemDetails.service] Failed to fetch specific problem details from LeetCode for ${slug}:`, fetchErr.message);
      
      // If we don't even have a record in DB, throw the error
      if (!problem) {
        throw new Error(`Problem not found. LeetCode sync error: ${fetchErr.message}`);
      }

      // If we do have a record in DB, mark it as fallback with default content so the user can still access the page
      problem.lastFetchAttempt = new Date();
      problem.isFallback = true;
      if (!problem.content) {
        problem.content = `<p>The description for <strong>${problem.title}</strong> is currently unavailable because the LeetCode API is rate-limited. Please try again in a few minutes.</p><h3>Example Test Cases</h3><p>Use the console below to test your solution.</p>`;
      }
      if (!problem.boilerplates || !problem.boilerplates.cpp) {
        problem.boilerplates = {
          cpp: `class Solution {\npublic:\n    // Write your code here\n};`
        };
      }
      if (!problem.testCases || problem.testCases.length === 0) {
        problem.testCases = [
          { input: 'N/A', output: 'N/A', isSample: true }
        ];
      }

      // Save the fallback data back to MongoDB so we respect the cooldown on subsequent reloads
      await problem.save().catch((saveErr) => console.warn(`[getProblemDetails.service] Failed to save fallback details: ${saveErr.message}`));
    }
  }

  return problem;
};
