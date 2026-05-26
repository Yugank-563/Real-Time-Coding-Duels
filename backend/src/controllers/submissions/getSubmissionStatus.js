import { getSubmissionStatusService } from '../../services/submissions/index.js';

export const getSubmissionStatus = async (req, res) => {
  try {
    const result = await getSubmissionStatusService(req.params.id, req.userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Submission not found.') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'You do not have access to view this submission.') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
