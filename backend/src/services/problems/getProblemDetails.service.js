import { findProblemBySlugOrTitle } from '../../repositories/index.js';
import { fetchAndStoreProblemDetails } from '../problemService.js';

export const getProblemDetailsService = async (slug) => {
  let problem = await findProblemBySlugOrTitle(slug);
  
  if (!problem) {
    const err = new Error(`Problem not found: ${slug}`);
    err.status = 404;
    throw err;
  }

  const needsFetch = !problem.content || 
    !problem.boilerplates || 
    !problem.boilerplates.cpp || 
    !problem.testCases || 
    problem.testCases.length === 0;

  if (needsFetch) {
    console.log(`[getProblemDetails.service] Problem details missing or incomplete for "${slug}". Fetching dynamically from LeetCode...`);
    try {
      const updated = await fetchAndStoreProblemDetails(slug);
      if (updated) {
        problem = updated;
      }
    } catch (fetchErr) {
      console.error(`[getProblemDetails.service] Failed to fetch specific problem details from LeetCode for ${slug}:`, fetchErr.message);
      throw new Error(`Problem not found. LeetCode sync error: ${fetchErr.message}`);
    }
  }

  return problem;
};
