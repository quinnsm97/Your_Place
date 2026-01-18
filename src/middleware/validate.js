import ApiError from "../utils/ApiError.js";

/**
 * validate(schema, location)
 * location: "body" | "params" | "query"
 */
function validate(schema, location = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[location]);
    if (!result.success) {
      return next(
        new ApiError(400, "VALIDATION_ERROR", "Request validation failed", result.error.issues)
      );
    }
    req[location] = result.data; // use parsed/cleaned values
    next();
  };
}

export default validate;
