import { Problem } from '../models/index.js';

export const findProblemsByDifficulty = async (difficulty) => {
  return await Problem.find({ difficulty });
};

export const findAllProblems = async () => {
  return await Problem.find({});
};

export const findProblemById = async (id) => {
  return await Problem.findById(id);
};

export const getPaginatedProblems = async (query, skip, limitNum) => {
  return await Problem.find(query, { title: 1, titleSlug: 1, difficulty: 1, tags: 1 })
    .skip(skip)
    .limit(limitNum)
    .lean();
};

export const countProblems = async (query) => {
  return await Problem.countDocuments(query);
};

export const findProblemBySlugOrTitle = async (slug) => {
  let problem = await Problem.findOne({ titleSlug: slug });
  if (!problem) {
    const formattedTitle = slug.replace(/-/g, ' ');
    problem = await Problem.findOne({
      title: { $regex: new RegExp('^' + formattedTitle + '$', 'i') }
    });
  }
  return problem;
};
