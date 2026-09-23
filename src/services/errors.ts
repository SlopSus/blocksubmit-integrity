export class ApiError extends Error {
  constructor(message: string, public status = 500, public code = "API_ERROR") { super(message); }
}
export function normalizeError(error: unknown) {
  return error instanceof ApiError ? error : new ApiError(error instanceof Error ? error.message : "Something went wrong.");
}
