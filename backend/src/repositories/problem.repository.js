import { Problem } from '../models/index.js';

// Constants
const PAGINATION_SELECT = { title: 1, titleSlug: 1, difficulty: 1, tags: 1 };


// Find
const findById = (id) => Problem.findById(id);


const findBySlugOrTitle = async (slug) => {
  let problem = await Problem.findOne({ titleSlug: slug });
  if (!problem) {
    const formattedTitle = slug.replace(/-/g, ' ');
    problem = await Problem.findOne({
      title: { $regex: new RegExp('^' + formattedTitle + '$', 'i') }
    });
  }
  return problem;
};

const findByQuery = (query, limit = 50) => Problem.find(query).limit(limit);


// Search
const count = (query) => Problem.countDocuments(query);

const getPaginated = (query, skip, limitNum) => 
  Problem.find(query, PAGINATION_SELECT)
    .skip(skip)
    .limit(limitNum)
    .lean();


// Update
const findOneAndUpdate = (filter, updateData, options = { upsert: true, new: true }) => 
  Problem.findOneAndUpdate(filter, updateData, options);


// Backward Compatibility Aliases
export const findProblemById = findById;
export const findProblemBySlugOrTitle = findBySlugOrTitle;
export const findProblemsByQuery = findByQuery;
export const countProblems = count;
export const getPaginatedProblems = getPaginated;
export const findOneAndUpdateProblem = findOneAndUpdate;
