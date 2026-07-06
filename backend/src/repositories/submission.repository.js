import { Submission } from '../models/index.js';


// Create
const create = (data) => Submission.create(data);


// Find
const findById = (id) => Submission.findById(id);

const find = (query, selections = '', sort = {}) => 
  Submission.find(query).select(selections).sort(sort);

const findOne = (query, sort = {}) => 
  Submission.findOne(query).sort(sort);


// Update
const updateById = (id, updateData) => 
  Submission.findByIdAndUpdate(id, updateData, { new: true });


// Aggregate
export const getProfileActivityHeatmap = (userId) => {
  const oneYearAgo = new Date();
  oneYearAgo.setHours(0, 0, 0, 0);
  oneYearAgo.setDate(oneYearAgo.getDate() - 364);
  return Submission.aggregate([
    { $match: { userId, createdAt: { $gte: oneYearAgo }, isSubmit: { $ne: false } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};


// Backward Compatibility Aliases
export const createSubmission = create;
export const findSubmissionById = findById;
export const findSubmissions = find;
export const findOneSubmission = findOne;
export const updateSubmissionById = updateById;
