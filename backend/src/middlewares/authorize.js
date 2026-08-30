export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.roles?.some((role) => allowedRoles.includes(role)))
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
          details: {},
        },
      });
    next();
  };
}
