import { getProblemDetailsService } from '../../services/index.js';

export const getProblemDetails = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const problem = await getProblemDetailsService(slug);
    const problemObj = problem.toObject ? problem.toObject({ flattenMaps: true }) : problem;
    
    // Security: Only send sample testcases to the frontend
    if (problemObj.testCases) {
      problemObj.testCases = problemObj.testCases.filter(tc => tc.isSample);
    }
    
    // Security: Hide internal B2 paths and counts from frontend
    delete problemObj.testCaseConfig;

    res.json(problemObj);
  } catch (err) {
    next(err);
  }
};
