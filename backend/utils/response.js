export default function responseMiddleware(req, res, next) {
  res.success = (payload = {}, status = 200) => {
    if (typeof payload === 'string') payload = { message: payload };
    return res.status(status).json(Object.assign({ success: true }, payload));
  };

  res.error = (message = 'Error', status = 400, details = undefined) => {
    const body = { success: false, error: message };
    if (details) body.details = details;
    return res.status(status).json(body);
  };

  next();
}
