import { Problem } from '../models/index.js';

// Constants
const PAGINATION_SELECT = { title: 1, titleSlug: 1, difficulty: 1, tags: 1 };


// Find
export const findById = (id) => Problem.findById(id);

export const findAll = () => Problem.find({});

export const findByDifficulty = (difficulty) => Problem.find({ difficulty });

export const findBySlugOrTitle = async (slug) => {
  let problem = await Problem.findOne({ titleSlug: slug });
  if (!problem) {
    const formattedTitle = slug.replace(/-/g, ' ');
    problem = await Problem.findOne({
      title: { $regex: new RegExp('^' + formattedTitle + '$', 'i') }
    });
  }
  return problem;
};

export const findByQuery = (query, limit = 50) => Problem.find(query).limit(limit);


// Search
export const count = (query) => Problem.countDocuments(query);

export const getPaginated = (query, skip, limitNum) => 
  Problem.find(query, PAGINATION_SELECT)
    .skip(skip)
    .limit(limitNum)
    .lean();


// Update
export const findOneAndUpdate = (filter, updateData, options = { upsert: true, new: true }) => 
  Problem.findOneAndUpdate(filter, updateData, options);


// Backward Compatibility Aliases
export const findProblemById = findById;
export const findAllProblems = findAll;
export const findProblemsByDifficulty = findByDifficulty;
export const findProblemBySlugOrTitle = findBySlugOrTitle;
export const findProblemsByQuery = findByQuery;
export const countProblems = count;
export const getPaginatedProblems = getPaginated;
export const findOneAndUpdateProblem = findOneAndUpdate;
