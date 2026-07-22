import { findProblemBySlugOrTitle } from '../../repositories/index.js';

export const getProblemDetailsService = async (slug) => {
  let problem = await findProblemBySlugOrTitle(slug);
  
  if (!problem) {
    const err = new Error(`Problem not found: ${slug}`);
    err.status = 404;
    throw err;
  }

  return problem;
};