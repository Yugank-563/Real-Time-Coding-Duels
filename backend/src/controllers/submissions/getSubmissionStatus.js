import { getSubmissionStatusService } from '../../services/index.js';

export const getSubmissionStatus = async (req, res, next) => {
  try {
    const result = await getSubmissionStatusService(req.params.id, req.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
}
};
