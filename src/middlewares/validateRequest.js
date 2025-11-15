export function validateRequest(schemas) {
  return (req, res, next) => {
    const errors = [];

    for (const [part, schema] of Object.entries(schemas)) {
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        result.error.errors.forEach((issue) => {
          errors.push({ path: `${part}.${issue.path.join(".")}`, message: issue.message });
        });
      } else {
        req[part] = result.data;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return next();
  };
}
