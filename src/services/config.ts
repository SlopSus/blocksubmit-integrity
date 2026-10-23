const getEnv = (): Record<string, string | undefined> => {
  return ((typeof import.meta !== "undefined" && import.meta.env)
    ? import.meta.env
    : process.env) as Record<string, string | undefined>;
};

export const serviceConfig = {
  get useMock(): boolean {
    const env = getEnv();
    const val = env["VITE_USE_MOCK_API"];
    return String(val).trim().toLowerCase() !== "false";
  },
  get apiUrl(): string {
    const env = getEnv();
    const val = env["VITE_API_URL"];
    return typeof val === "string" && val.trim() ? val.trim() : "http://localhost:5000/api";
  },
};
