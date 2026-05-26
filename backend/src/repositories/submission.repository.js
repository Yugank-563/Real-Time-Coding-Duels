import Submission from '../models/Submission.js';

export const createSubmission = async (data) => {
  return await Submission.create(data);
};

export const findSubmissionById = async (id) => {
  return await Submission.findById(id);
};

export const findSubmissions = async (query, selections = '', sort = {}) => {
  return await Submission.find(query).select(selections).sort(sort);
};
