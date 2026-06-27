import { Submission } from '../models/index.js';

export const createSubmission = async (data) => {
  return await Submission.create(data);
};

export const findSubmissionById = async (id) => {
  return await Submission.findById(id);
};

export const findSubmissions = async (query, selections = '', sort = {}) => {
  return await Submission.find(query).select(selections).sort(sort);
};

export const getProfileSubmissionStats = async (userId) => {
  return await Submission.aggregate([
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
};

export const getProfileDifficultyBreakdown = async (userId) => {
  return await Submission.aggregate([
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
};
