export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    success: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: status === 500 && process.env.NODE_ENV === "production" ? "An unexpected error occurred" : error.message,
      details: error.details || {},
    },
  });
}
