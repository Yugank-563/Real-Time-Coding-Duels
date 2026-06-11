export const validateRequest = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Mutate request to apply default values and strip unknown fields from Zod
    req.body = validatedData.body || req.body;
    req.query = validatedData.query || req.query;
    req.params = validatedData.params || req.params;
    
    next();
  } catch (error) {
    next(error);
  }
};
