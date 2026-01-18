import ApiError from "../utils/ApiError.js";

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "UNAUTHORIZED", "Missing authentication"));
    if (req.user.role !== role) {
      return next(new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action"));
    }
    next();
  };
}

export default requireRole;
