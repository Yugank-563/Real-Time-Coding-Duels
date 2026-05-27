import Problem from '../models/Problem.js';

export const getDistinctTags = async () => {
  return await Problem.distinct('tags');
};

export const findProblemsByDifficulty = async (difficulty) => {
  return await Problem.find({ difficulty });
};

export const findAllProblems = async () => {
  return await Problem.find({});
};

export const findProblemById = async (id) => {
  return await Problem.findById(id);
};

