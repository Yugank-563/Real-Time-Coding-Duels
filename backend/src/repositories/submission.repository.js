import { Submission } from '../models/index.js';


// Create
export const create = (data) => Submission.create(data);


// Find
export const findById = (id) => Submission.findById(id);

export const find = (query, selections = '', sort = {}) => 
  Submission.find(query).select(selections).sort(sort);

export const findOne = (query, sort = {}) => 
  Submission.findOne(query).sort(sort);


// Update
export const updateById = (id, updateData) => 
  Submission.findByIdAndUpdate(id, updateData, { new: true });


// Aggregate
export const getProfileStats = (userId) => 
  Submission.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        accepted: {
          $sum: { $cond: [{ $eq: ['$verdict', 'AC'] }, 1, 0] },
        },
        uniqueProblems: { $addToSet: '$problemId' },
      },
    },
  ]);

export const getProfileDifficultyBreakdown = (userId) => 
  Submission.aggregate([
    { $match: { userId, verdict: 'AC' } },
    {
      $group: {
        _id: '$problemId',
      },
    },
    {
      $lookup: {
        from: 'problems',
        localField: '_id',
        foreignField: '_id',
        as: 'problem',
      },
    },
    { $unwind: '$problem' },
    {
      $group: {
        _id: '$problem.difficulty',
        count: { $sum: 1 },
      },
    },
  ]);


// Backward Compatibility Aliases
export const createSubmission = create;
export const findSubmissionById = findById;
export const findSubmissions = find;
export const findOneSubmission = findOne;
export const updateSubmissionById = updateById;
export const getProfileSubmissionStats = getProfileStats;
