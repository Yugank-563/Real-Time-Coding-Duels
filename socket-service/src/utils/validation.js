export const validateSocketPayload = (schema, data, socket, eventName) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    socket.emit('error', { message: `Validation failed for ${eventName}`, details: result.error.issues });
    return null;
  }
  return result.data;
};
