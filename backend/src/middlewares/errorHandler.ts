export const errorHandler = (
  err: Error,
  _req: import("express").Request,
  res: import("express").Response,
  _next: import("express").NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
};