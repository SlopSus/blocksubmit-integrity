export const serviceConfig = {
  useMock: import.meta.env.VITE_USE_MOCK_API !== "false",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
};
