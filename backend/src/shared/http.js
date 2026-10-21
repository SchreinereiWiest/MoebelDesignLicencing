export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export function errorHandler(error, _req, res, _next) {
  const status = error instanceof HttpError ? error.status : 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: error instanceof HttpError ? error.code : "INTERNAL_SERVER_ERROR",
    message: status >= 500 ? "Interner Serverfehler" : error.message
  });
}
