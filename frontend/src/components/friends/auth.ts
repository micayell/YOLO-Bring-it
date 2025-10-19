export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};